import fs from "fs"
import readline from "readline"
const path = "./passwords.json"
let create = false

const renk_bitis = "\x1b[0m"
const red = "\x1b[31m"
const green = "\x1b[32m"
const blue = "\x1b[34m"
const purple = "\x1b[35m"
const turuncu = "\x1b[33m"
const bold = "\x1b[1m"

function printWarning(msg) {
  console.log(`${turuncu}${bold}UYARI:${renk_bitis} ${turuncu}${msg}${renk_bitis}`)
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

let jsonFileData = {}
fs.readFile(path, "utf8", (err, data) => {
  if (err) {
    console.error(`${red}Dosya okunurken bir hata oluştu: ${err}${renk_bitis}`)
    return
  } else {
    try {
      jsonFileData = JSON.parse(data)
    } catch (parseErr) {
      console.error(`${red}JSON parse hatası: ${parseErr}${renk_bitis}`)
      jsonFileData = {}
    }
  }
})

rl.question(`Lütfen yapmak istediğiniz işlemi yazınız: `, input => {
  input = input.trim().toLocaleLowerCase()
  if (input == "liste" && input.split(" ").length == 1) {
    let yuri
    let kullaniciadi
    for (let i = 0; i < Object.keys(jsonFileData).length; i++) {
      yuri = `${Object.keys(jsonFileData)[i]}`
      kullaniciadi = jsonFileData[yuri]
      console.log(`${purple}${i + 1}. Site: ${yuri.slice(0, 1).toLocaleUpperCase()}${yuri.slice(1).slice(0, -1)}${renk_bitis} ${red}Kullanıcı Adı: ${kullaniciadi["username"]}${renk_bitis}`)
    }
    rl.close()
  } 
  else if (input == "help" && input.split(" ").length == 1) {
    help()
  } 
  else if (input.startsWith("delete") && input.split(" ").length < 3) {
    let yuri = input.split(" ")
    let site = yuri[1]
    if (yuri.length != 2) {
      printWarning("Bir hata oluştu, lütfen daha sonra tekrar deneyin!")
    }

    if (jsonFileData[site]) {
      delete jsonFileData[site]

      saveDataToFile(() => {
        console.log(`${green}Kayıt başarıyla silindi${renk_bitis}`)
        rl.close()
      })
    } else {
      console.log(`${red}Böyle bir kayıt bulunamadı${renk_bitis}`)
    }

    rl.close()
  } 
  else if (input.startsWith("get") && input.split(" ").length < 3) {
    let yuri = input.split(" ")
    if (yuri.length != 2) {
      printWarning("Bir hata oluştu, lütfen daha sonra tekrar deneyin!")
    }
    let siteName = yuri[1]
    let name = Object.keys(jsonFileData)

    if (jsonFileData[siteName + 0] == null) {
      printWarning("Böyle bir site adında kayıt bulunmamakta")
    }

    for (let i = 0; i < name.length; i++) {
      console.log(jsonFileData[name[i]])
    }
    rl.close()
  }
  else if (input == "create" && input.split(" ").length == 1) {
    create = true
    createAcc()
  } 
  else {
    printWarning("Lütfen belirtilen formatta giriş yapın")
  }

  if (!create) rl.close()
})

function help() {
  console.log(`
        Kullanabileceğiniz komutlar:

        liste              : Kayıtlı tüm siteleri listeler.

        help               : Yardım metnini gösterir.

        get <site_adı>     : Belirtilen siteye ait kullanıcı adı ve şifre bilgilerini gösterir.

        delete <site_adı>  : Belirtilen siteye ait kaydı siler.

        create             : Yeni bir site, kullanıcı adı ve şifre kaydı oluşturur.
    `)
  rl.close()
}

function createAcc() {
  rl.question(`lütfen <Site Adresi> <Kullanıcı Adı> <Şifre> şeklinde girin: `, input => {
    if (input.split(" ").length == 3) {
      let logParts = input.split(" ")
      let site = `${logParts[0]}0`
      let username = logParts[1]
      let password = logParts[2]

      while (jsonFileData[site]) {
        site = `${site.slice(0, -1)}${parseInt(site[site.length - 1]) + 1}`
      }

      if (site.length < 3 || username.length < 3 || password.length < 3) {
        printWarning("Lütfen belirtilen formatta giriş yapın")
      }

      const yeniGirdi = {
        site: site.slice(0, -1),
        username: username,
        password: password
      }
      jsonFileData[site] = yeniGirdi

      saveDataToFile(() => {
        console.log(`${green}Başarıyla kaydedildi${renk_bitis}`)
        rl.close()
      })
    } else {
      printWarning("Lütfen belirtilen formatta 3 bilgi girin (site, kullanıcı adı, şifre)")
      rl.close()
    }
  })
}

function saveDataToFile(callback) {
  const json = JSON.stringify(jsonFileData, null, 2)
  fs.writeFile(path, json, "utf8", (err) => {
    if (err) {
      console.error(`${red}Kaydedilirken bir hata oluştu. Hata: ${err}${renk_bitis}`)
    }
    if (callback) {
      callback()
    }
  })
}