import fs from "fs"
import base32 from "base32.js"
const { Encoder, Decoder } = base32
import readline from "readline"

const path = "./passwords.json"

const renk_bitis = "\x1b[0m"
const red = "\x1b[31m"
const green = "\x1b[32m"
const blue = "\x1b[34m"
const purple = "\x1b[35m"
const turuncu = "\x1b[33m"
const bold = "\x1b[1m"

function sifrele(text) {
  const v1 = new Encoder()
  return Buffer.from(v1.write(text).finalize()).toString("base64")
}

function coz(data) {
  const minos = new Decoder()
  const base32Str = Buffer.from(data, "base64").toString()
  return minos.write(base32Str).finalize().toString()
}

function printWarning(msg) {
  console.log(`${turuncu}${bold}UYARI:${renk_bitis} ${turuncu}${msg}${renk_bitis}`)
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

let jsonFileData = {}
if (fs.existsSync(path)) {
  try {
    const dosyaVerisi = fs.readFileSync(path, "utf8")
    jsonFileData = dosyaVerisi ? JSON.parse(dosyaVerisi) : {}
  } catch (parseErr) {
    console.error(`${red}JSON parse hatası: ${parseErr}${renk_bitis}`)
    jsonFileData = {}
  }
} else {
  fs.writeFileSync(path, JSON.stringify({}, null, 2), "utf8")
}

rl.question(`Lütfen yapmak istediğiniz işlemi yazınız: `, input => {
  const temizInput = input.trim()
  const parcalar = temizInput.split(" ")
  const command = parcalar[0].toLocaleLowerCase()

  if (command === "liste" && parcalar.length === 1) {
    liste()
  } else if (command === "help" && parcalar.length === 1) {
    help()
  } else if (command === "delete" && parcalar.length === 2) {
    deleteLog(parcalar[1].toLocaleLowerCase())
  } else if (command === "get" && parcalar.length === 2) {
    get(parcalar[1].toLocaleLowerCase())
  } else if (command === "create" && parcalar.length === 1) {
    createAcc()
  } else {
    printWarning("Lütfen belirtilen formatta giriş yapın (Komutlar için 'help' yazın)")
    rl.close()
  }
})

function help() {
  console.log(`
        ${red}Kullanabileceğiniz komutlar:${renk_bitis}

        ${purple}liste${renk_bitis}             : ${blue}Kayıtlı tüm siteleri listeler.${renk_bitis}
        ${purple}help${renk_bitis}              : ${blue}Yardım metnini gösterir.${renk_bitis}
        ${purple}get <site_adı>${renk_bitis}    : ${blue}Belirtilen siteye ait kullanıcı adı ve şifre bilgilerini gösterir.${renk_bitis}
        ${purple}delete <site_adı>${renk_bitis} : ${blue}Belirtilen siteye ait kaydı siler.${renk_bitis}
        ${purple}create${renk_bitis}            : ${blue}Yeni bir site, kullanıcı adı ve şifre kaydı oluşturur.${renk_bitis}
    `)
  rl.close()
}

function createAcc() {
  rl.question(`Lütfen <Site Adresi> <Kullanıcı Adı> <Şifre> şeklinde girin: `, input => {
    const logParts = input.trim().split(" ")
    if (logParts.length === 3) {
      const siteAdi = logParts[0].toLocaleLowerCase()
      const username = logParts[1]
      const password = logParts[2]

      if (siteAdi.length < 3 || username.length < 3 || password.length < 3) {
        printWarning("Site, kullanıcı adı ve şifre en az 3 karakter olmalıdır.")
        rl.close()
        return
      }

      let sayac = 0
      while (jsonFileData[`${siteAdi}${sayac}`]) {
        sayac++
      }

      const yeniKey = `${siteAdi}${sayac}`
      jsonFileData[yeniKey] = {
        site: siteAdi,
        username: sifrele(username),
        password: sifrele(password)
      }

      saveDataToFile(() => {
        console.log(`${green}Başarıyla kaydedildi (${yeniKey})${renk_bitis}`)
        rl.close()
      })
    } else {
      printWarning("Lütfen aralarında boşluk bırakarak 3 bilgi girin (site, kullanıcı adı, şifre)")
      rl.close()
    }
  })
}

function saveDataToFile(callback) {
  const json = JSON.stringify(jsonFileData, null, 2)
  fs.writeFile(path, json, "utf8", (err) => {
    if (err) {
      console.error(`${red}Kaydedilirken bir hata oluştu. Hata: ${err}${renk_bitis}`)
    } else if (callback) {
      callback()
    }
  })
}

function get(siteName) {
  const kayitlar = Object.keys(jsonFileData).filter(k => jsonFileData[k].site === siteName)

  if (kayitlar.length === 0) {
    printWarning("Böyle bir site adında kayıt bulunmamakta")
    rl.close()
    return
  }

  kayitlar.forEach(gabriel => {
    const entry = jsonFileData[gabriel]
    const decodedUsername = coz(entry.username)
    const decodedPassword = coz(entry.password)
    console.log(`${blue}Kayıt: ${gabriel}${renk_bitis} | ${green}Kullanıcı Adı: ${decodedUsername}${renk_bitis} | ${red}Şifre: ${decodedPassword}${renk_bitis}`)
  })
  rl.close()
}

function deleteLog(siteName) {
  const silinecek = jsonFileData[siteName] ? siteName : `${siteName}0`

  if (jsonFileData[silinecek]) {
    delete jsonFileData[silinecek]
    saveDataToFile(() => {
      console.log(`${green}${silinecek} kaydı başarıyla silindi${renk_bitis}`)
      rl.close()
    })
  } else {
    console.log(`${red}Böyle bir kayıt bulunamadı${renk_bitis}`)
    rl.close()
  }
}

function liste() {
  const keys = Object.keys(jsonFileData)
  if (keys.length === 0) {
    printWarning("Henüz kayıtlı bir şifre bulunmuyor.")
    rl.close()
    return
  }

  keys.forEach((key, i) => {
    const kullanici = jsonFileData[key]
    const decodedUsername = coz(kullanici.username)
    const siteBaslik = kullanici.site.charAt(0).toLocaleUpperCase() + kullanici.site.slice(1)
    console.log(`${purple}${i + 1}. Site: ${siteBaslik} (${key})${renk_bitis} - ${red}Kullanıcı Adı: ${decodedUsername}${renk_bitis}`)
  })
  rl.close()
}