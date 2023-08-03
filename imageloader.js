var cardlist = [];
{
	var lang = ["ja", "en", "ko", "zh", "zhg1"];
	for (i = 0; i < lang.length; i++) {
		json_load('cardlist_' + lang[i] + '.json');
	}
}
const cardsdirURL = chrome.runtime.getURL('cards/');
const enalbe_css_class = "fbs-image-loader-enabled"; // ImageLoaderが有効であることを表すCSSクラス名

function json_load(json_filename) {	// カード名の連想配列読み込み 
	var xhr = new XMLHttpRequest();
	xhr.open('GET', chrome.runtime.getURL(json_filename), true);
	xhr.onreadystatechange = function () {
		if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
			if (xhr.response) {
				var parsed_response = JSON.parse(xhr.responseText);
				cardlist = Object.assign(cardlist, parsed_response);
			}
		}
	};
	xhr.send();
}

function backimage_reset(class_name) {	// カード画像解除 
	var resetelements = document.getElementsByClassName(class_name);
	for (var i = 0, l = resetelements.length; i < l; i++) {
		resetelements[i].style.backgroundImage = null;
		resetelements[i].style.cssText = resetelements[i].style.cssText.replace(/transform:\srotate\(\d{1,3}deg\);/, '');
		resetelements[i].classList.remove(enalbe_css_class);
	}
}

function image_load() {	// カード画像設定 
	console.trace('image_load()');
	var openelements = document.getElementsByClassName('open-normal');	// 表向きカードの抽出
	console.log(openelements);
	for (var i = 0, l = openelements.length; i < l; i++) {
		var card_name;
		try {
			card_name = openelements[i].getElementsByClassName('card-name')[0].innerText;
			var card_image_name = cardlist[card_name];
			if (card_image_name === undefined) { // カード画像が見つからなかったカードは付与したhidden属性を消す。
				for (var j = 0, k = openelements[i].children.length; j < k; j++) {
					openelements[i].children[j].removeAttribute('hidden');
				}
				continue;
			}
			// カード画像を設定
			var card_image_URL = cardsdirURL + card_image_name;
			openelements[i].style.backgroundImage = 'url(' + card_image_URL + ')';
			openelements[i].classList.add(enalbe_css_class);
			if ((/rotated/.test(openelements[i].className))) {
				openelements[i].style.cssText = openelements[i].style.cssText.replace(/transform:\srotate\(\d{1,3}deg\);/, '');
			} else {
				if (/opponent-side/.test(openelements[i].className)) {	// 対戦相手のカードを逆さに 
					openelements[i].style.cssText = openelements[i].style.cssText + 'transform: rotate(180deg)';
				} else {
					openelements[i].style.cssText = openelements[i].style.cssText + 'transform: rotate(0deg)';
				}
			}
			openelements[i].children[0].setAttribute('hidden', '');	// テキストを非表示に 
			//		if (openelements[i].className.match("selected") != null) {
			if (openelements[i].children[2] != null) {	// マリガンの時の数字だけ表示 
				openelements[i].children[1].removeAttribute('hidden');
				try {
					openelements[i].children[2].setAttribute('hidden', '');
				} catch (typeError) {
					openelements[i].children[1].setAttribute('hidden', '');
				}
			} else {
				openelements[i].children[1].setAttribute('hidden', '');
			}
		} catch (error) {
			console.error(error);
			// アキナ対策, アキナのカードはカードテキストが設定されておらずTypeErrorが出るので握りつぶす
			if (!(error instanceof TypeError)) {
				throw error;
			}
		}
	}
	backimage_reset('back-normal');
	backimage_reset('back-special');
	backimage_reset('back-poison');
	backimage_reset('back-troop');
}

const observe_conf = {
	childList: true,
	subtree: true
}
const observe_elem = document.body;

var observer;
observer = new MutationObserver(function () {
	observer.disconnect();
	image_load();
	observer.observe(observe_elem, observe_conf);
});
observer.observe(observe_elem, observe_conf);

console.log('image-loader stand by!');
