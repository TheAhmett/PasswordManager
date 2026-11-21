import crypto from "crypto"
const alfabe = [ "a", "b", "c", "ç", "d", "e", "f", "g", "ğ", "h", "ı", "i", "j", "k", "l", "m", "n", "o", "ö", "p","q", "r", "s", "ş", "t", "u", "ü", "v", "w", "x", "y", "z"]

const text = "Gazoz içecekleri en sevdiğim tür"

async function randomNumber() {
  const sayi = await crypto.randomInt(4, 8)
  let response = ""
  for (let i = 0; i < sayi; i++) {
    const number = crypto.randomBytes(1)[0] % alfabe.length
    const upper = crypto.randomBytes(1)[0] % 2 === 0
    response += upper ? alfabe[number].toLocaleUpperCase() : alfabe[number]
  }
  return response
}

async function encryptText(text) {
  let cryptedLetter = ""
  for (let i = 0; i < text.length; i++) {
    if(text[i] === " ") {
      cryptedLetter += " "
    } else {
      const ahmet = await randomNumber()
      cryptedLetter += ahmet
    }
  }
  return cryptedLetter
}

encryptText(text).then(result => console.log(result))
