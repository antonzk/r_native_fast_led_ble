chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

const toBase64 = (input: string = '') => {
  let str = input;
  let output = '';

  for (let block = 0, charCode, i = 0, map = this.chars;
    str.charAt(i | 0) || (map = '=', i % 1);
    output += map.charAt(63 & block >> 8 - i % 1 * 8)) {

    charCode = str.charCodeAt(i += 3 / 4);

    if (charCode > 0xFF) {
      console.error("The string to be encoded contains characters outside of the Latin1 range")
      return;
    }
    block = block << 8 | charCode;
  }

  return output;
}


const fromBase64 = (input: string = '') => {
  let str = input.replace(/=+$/, '');
  let output = '';

  if (str.length % 4 == 1) {
    console.error("'atob' failed: The string to be decoded is not correctly encoded.")
    return;
  }
  for (let bc = 0, bs = 0, buffer, i = 0;
    buffer = str.charAt(i++);

    ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
      bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
  ) {
    buffer = chars.indexOf(buffer);
  }

  return output;
}

export default { fromBase64,toBase64 }