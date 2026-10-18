use std::io::{BufRead, BufReader, Read};

const NEWLINE: u8 = b'\n';
const CARRIAGE_RETURN: char = '\r';

/// Every line a process writes, read as text even when some of it is not valid UTF-8, so one odd byte never ends the reading.
pub fn lossy_lines(output: impl Read) -> impl Iterator<Item = String> {
    BufReader::new(output)
        .split(NEWLINE)
        .map_while(Result::ok)
        .map(|bytes| String::from_utf8_lossy(&bytes).trim_end_matches(CARRIAGE_RETURN).to_string())
}
