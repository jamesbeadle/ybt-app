use std::io::{BufRead, BufReader, Write};
use std::net::{TcpListener, TcpStream};
use tauri::{AppHandle, Emitter};

const LOOPBACK_ADDRESS: &str = "127.0.0.1:0";
const REDIRECT_EVENT: &str = "sign-in-redirect";
const SIGNED_IN_PAGE: &str = "HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\nConnection: close\r\n\r\n\
<!doctype html><title>YBT</title><p>You are signed in. You can close this window and go back to YBT.</p>";

/// Listens once on a loopback port for YBT's sign-in redirect and hands its path to the app.
#[tauri::command]
pub fn start_sign_in_listener(app: AppHandle) -> Result<u16, String> {
    let listener = TcpListener::bind(LOOPBACK_ADDRESS).map_err(|error| error.to_string())?;
    let port = listener.local_addr().map_err(|error| error.to_string())?.port();
    std::thread::spawn(move || {
        if let Ok((stream, _)) = listener.accept() {
            answer_redirect(&app, stream);
        }
    });
    Ok(port)
}

fn answer_redirect(app: &AppHandle, mut stream: TcpStream) {
    let path = read_request_path(&stream).unwrap_or_default();
    let _ = stream.write_all(SIGNED_IN_PAGE.as_bytes());
    let _ = app.emit(REDIRECT_EVENT, path);
}

fn read_request_path(stream: &TcpStream) -> Option<String> {
    let mut request_line = String::new();
    BufReader::new(stream).read_line(&mut request_line).ok()?;
    request_line.split_whitespace().nth(1).map(String::from)
}
