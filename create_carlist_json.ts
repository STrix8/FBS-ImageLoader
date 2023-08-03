import * as f_data from "./furuyoni-data/dist";
import * as fs from "fs";
import * as path from "path";

function anotherVerCard(dirpath: string, file_name_prefix: string): string[] {
    var ret_list: string[] = [];
    var list = fs.readdirSync(dirpath);
    if (list !== undefined) {
        list.filter(function (card_name) {
            var file_name = path.parse(card_name).name;
            var reg = new RegExp("^" + file_name_prefix + "(_s\\d(_\\d)?)?$");
            return file_name.match(reg) !== null;
        }).forEach(function (value) {
            ret_list.push(path.parse(value).name);
        });
    }
    return ret_list;
}

function latestCardName(cards: Array<string>) {
    var latest_card: string = "";
    cards.forEach((value, i) => {
        if (latest_card < value) {
            latest_card = value;
        }
    });
    return latest_card;
}

var ja: { [key: string]: string; } = {};
var en: { [key: string]: string; } = {};
var ko: { [key: string]: string; } = {};
var zh: { [key: string]: string; } = {};
var zhg1: { [key: string]: string; } = {};

const latest_card_data = f_data.CARD_DATA["na-s8"];

function addDict(dict: { [key: string]: string; }, key: string, value: string) {
    if (key) {
        // 構想カードの意志の面の対応
        if (value.match(/kanawe_o_p_\d_w/) !== null) {
            dict[key + " *"] = value;
        } else {
            dict[key] = value;
        }
    }
}

for (const key in latest_card_data) {
    if (latest_card_data[key] === null) {
        continue;
    }
    var card_id = key;
    // 力技パート
    card_id = card_id.replace('ex-', "ex");   // 追加札のカードIDのフォーマットが違うので修正
    card_id = card_id.replace("transform-0", "11-thallya-o-tf-");       // TransFormカードのフォーマットが違う
    card_id = card_id.replace("transform-A1-0", "11-thallya-a1-tf-");
    card_id = card_id.replace("-storm", "-a1-st");      // 嵐の力
    card_id = card_id.replace("kanawe-o-p-0", "kanawe-o-p-");   // 構想が2桁
    card_id = card_id.replace(/-o-p-(\d)-will/, '-o-p-$1-w');   // wがwill
    card_id = card_id.replace("22-kiriko-o-s-1", "22-kiriko-o-s-4");    // 巫女神楽はs1ではなくs4
    // 画像ファイル名に変換
    var image_name = "na_" + card_id.replace(/-/g, '_').toLowerCase();
    var cards: string[] = anotherVerCard(__dirname + "/cards", image_name);
    var full_image_name = latestCardName(cards) + ".png";
    addDict(ja, latest_card_data[key]["name"], full_image_name);
    addDict(en, latest_card_data[key]["nameEn"], full_image_name);
    addDict(ko, latest_card_data[key]["nameKo"], full_image_name);
    addDict(zh, latest_card_data[key]["nameZh"], full_image_name);
    addDict(zhg1, latest_card_data[key]["nameZhG1"], full_image_name);
}

try {
    console.log("ja: " + Object.keys(ja).length);
    console.log("en: " + Object.keys(en).length);
    console.log("ko: " + Object.keys(ko).length);
    console.log("zh: " + Object.keys(zh).length);
    console.log("zhg1: " + Object.keys(zhg1).length);

    fs.writeFileSync('cardlist_ja.json', JSON.stringify(ja));
    fs.writeFileSync('cardlist_en.json', JSON.stringify(en));
    fs.writeFileSync('cardlist_ko.json', JSON.stringify(ko));
    fs.writeFileSync('cardlist_zh.json', JSON.stringify(zh));
    fs.writeFileSync('cardlist_zhg1.json', JSON.stringify(zhg1));
} catch (e) {
    console.log(e);
}