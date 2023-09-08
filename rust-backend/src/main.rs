use actix_web::{get, http::header::ContentType, App, HttpResponse, HttpServer, Responder};
use leptos::*;
use std::{
    fs,
    sync::{Arc, Mutex, RwLock},
};
use wasi_common::pipe::{ReadPipe, WritePipe};
use wasmtime::*;
use wasmtime_wasi::WasiCtxBuilder;

static PRECOMPILED_WASM: Mutex<Vec<u8>> = Mutex::new(vec![]);

const HYDRATION_DATA: &str =
    r#"{ "message": "Hello from Rust! This string needs to be the same during hydration." }"#;

#[component]
fn App(content: String) -> impl IntoView {
    view! {
        <main>
            <h1>Hello World!</h1>
            <div id="react-app" inner_html={content}></div>
        </main>
    }
}

#[get("/")]
async fn home() -> impl Responder {
    // send data to wasm module
    let stdin = ReadPipe::from(HYDRATION_DATA);

    // create a buffer to store the response
    let stdout_buf: Vec<u8> = vec![];
    let stdout_mutex = Arc::new(RwLock::new(stdout_buf));
    let stdout = WritePipe::from_shared(stdout_mutex.clone());
    // create a wasmtime engine. cache config doesn't seem as necessary now that we're using an in-memory precompiled cache
    let mut engine_config = Config::new();
    engine_config
        .cache_config_load("wasmtime_config.toml")
        .unwrap();
    let engine = Engine::new(&engine_config).unwrap();
    // load the module (gets cached internally using cache config)
    // let module = Module::from_file(&engine, "ssr.wasm").unwrap(); // don't need this since we're using the precompiled in-memory cache
    let precompiled = PRECOMPILED_WASM.lock().unwrap();
    let module = unsafe { Module::deserialize(&engine, &*precompiled).unwrap() };

    // Configure and create a `WasiCtx`, which WASI functions need access to
    // through the host state of the store (which in this case is the host state
    // of the store)
    let mut linker = Linker::new(&engine);
    wasmtime_wasi::add_to_linker(&mut linker, |cx| cx).unwrap();
    let wasi_ctx = WasiCtxBuilder::new()
        .stdin(Box::new(stdin))
        .stdout(Box::new(stdout))
        .build();
    // create a store and module instance
    let mut store = Store::new(&engine, wasi_ctx);
    // instantiate the module
    let instance = linker.instantiate(&mut store, &module).unwrap();
    // locate the exported function
    let ssr_function = instance
        .get_typed_func::<(), ()>(&mut store, "ssr")
        .unwrap();
    // call and print the result
    ssr_function.call(&mut store, ()).unwrap();
    // read the response into a string
    let mut buffer: Vec<u8> = Vec::new();
    stdout_mutex
        .read()
        .unwrap()
        .iter()
        .for_each(|i| buffer.push(*i));
    let s = String::from_utf8(buffer).unwrap();

    HttpResponse::Ok()
        .content_type(ContentType::html())
        .body(format!(
            r#"<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script type="text/javascript">
            window.__HYDRATION_DATA__ = '{}'
        </script>
        <script type="module" src="/static/hydration.min.js"></script>
    </head>
    <body>
        {}
    </body>
</html>"#,
            HYDRATION_DATA,
            leptos::ssr::render_to_string(|| App(AppProps { content: s })).to_string()
        ))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    {
        let wasm_file = fs::read("ssr.wasm");

        // cache config doesn't seem as necessary now that we're using an in-memory precompiled cache
        let mut engine_config = Config::new();
        engine_config
            .cache_config_load("wasmtime_config.toml")
            .unwrap();
        let engine = Engine::new(&engine_config).unwrap();
        let mut precompiled = PRECOMPILED_WASM.lock().unwrap();
        *precompiled = engine.precompile_module(&wasm_file.unwrap()).unwrap();
    }

    HttpServer::new(|| {
        App::new()
            .service(home)
            .service(actix_files::Files::new("/static", "./static").show_files_listing())
    })
    .bind(("0.0.0.0", 3000))?
    .run()
    .await
}
