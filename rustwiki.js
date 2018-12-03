const request = require("request");
const cheerio = require("cheerio");

class Rust {
    getItems() {
        return new Promise((res, rej) => {
            pReq("http://rust.wikia.com/wiki/Items", {})
                .then(resp => this.parseItems(resp))
                .then(items => res(items));
        });
    }


    parseItems(html) {
        return new Promise((res, rej) => {
            let $ = cheerio.load(html);
            res(
                $("table")
                    .find("td").map((i, el) => {
                    return {
                        name: $(el).text().trim(),
                        img: $(el).find("img").attr("data-src") || $(el).find("img").attr("src"),
                        relUrl: $(el).find("a").first().attr("href"),
                        category: $(el).closest("table").prevUntil("table").find("span").first().text().trim()
                    };
                }).get()
            );
        });
    }


    getItemByName(name) {
        //TODO: dl this once and cache forever?
        return new Promise((res, rej) => {
            pReq(`http://rust.wikia.com/wiki/${name}`, {})
                .then(html => this.parseItemInfo(html))
                .then(info => res(info));
        });
    }


    parseItemInfo(itemHTML) {
        return new Promise((res, rej) => {
            let $ = cheerio.load(itemHTML);


            if ($("span.mw-headline").text().indexOf("was not found") !== -1) {
                res({"Error" : "Item not found"});
            }

            let desc = $("#mw-content-text").find("p").eq(1).text().trim();


            let name = $(".header-column, .header-title").find("h1").text().trim();
            let img = $("th.wikia-infobox-image").find("img").attr("src");

            console.log("IMG,", img);
            let infoTable = $(".item-infobox");
            let type = this.getInfoTableItem(infoTable, "Type");
            let stackSize = this.getInfoTableItem(infoTable, "Stacksize");
            let craftable = this.getInfoTableItem(infoTable, "Craftable") === "Yes";

            let craftSeconds = craftable ? parseInt(this.getInfoTableItem(infoTable, "Time To Craft").replace(" s")) : null;
            let craftMats = craftable ? this.getCraftMaterials(infoTable) : null;

            res({name, img, desc, type, stackSize, craftable, craftSeconds, craftMats});
        });
    }


    getInfoTableItem(infoTableCheerioObj, key) {
        let $ = cheerio;
        let rows = infoTableCheerioObj.find("tr");

        for (var i = 0; i < rows.length; i++) {
            let el = rows[i];
            let th = $(el).find("th").text().trim();
            let td = $(el).find("td").text().trim();
            if (th === key) {
                return td;
            }
        }
    }


    getCraftMaterials(infoTableCheerioObj) {
        let $ = cheerio;
        let rows = infoTableCheerioObj.find("tr");

        let ingredTitleRow = rows.filter((i, row) => {
            return $(row).find("div").text().trim() === "Ingredients";
        })[0];

        let ingredRow = $(ingredTitleRow).next("tr");
        return ingredRow.find("tr > th > div > div").map((i, el) => {
            let name = $(el).find("a").attr("title").trim();
            let qty = parseInt($(el).text().trim().replace("x", ""));
            return {
                name,
                qty
            }
        }).get();
    }
}


function pReq(url, data) {
    return new Promise(function (res, rej) {
        request.get(url, data, (err, resp, body) => {
            res(body);
        });
    });
}


module.exports = new Rust();