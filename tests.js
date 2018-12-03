var expect = require("expect");
var rust = require("./server/rustwiki.js");

describe("server", function (){
    describe("items api", function () {
       let items;
       before(function (done){
           rust.getItems().then(i => {
               items = i;
               done();
           });
       });


       it("should fetch the correct number of items", function (){
           // 320 items, 16 obsolete
           expect(items.length).toEqual(320);
       });

       it("should have the correct first and last item, as ordered on the wiki", function () {
           expect(items[0].name).toEqual("4x Zoom Scope");
           expect(items[items.length-1].name).toEqual("Camera");
       });

       it("should assign the correct category to each item", function () {
          expect(getItemByName(items, "4x Zoom Scope").category).toEqual("Weapons");
          expect(getItemByName(items, "Pump Jack").category).toEqual("Construction");
          expect(getItemByName(items, "Fridge").category).toEqual("Items");
          expect(getItemByName(items, "Sulfur Ore").category).toEqual("Resources");
          expect(getItemByName(items, "Metal Facemask").category).toEqual("Attire");
          expect(getItemByName(items, "Pick Axe").category).toEqual("Tools");
          expect(getItemByName(items, "Large Medkit").category).toEqual("Medical");
          expect(getItemByName(items, "Raw Human Meat").category).toEqual("Food");
          expect(getItemByName(items, "Rocket").category).toEqual("Ammunition");
          expect(getItemByName(items, "Auto Turret").category).toEqual("Traps");
          expect(getItemByName(items, "Acoustic Guitar").category).toEqual("Misc");
          expect(getItemByName(items, "Metal Spring").category).toEqual("Components");
          expect(getItemByName(items, "Bleach").category).toEqual("Obsolete Items");
       });

       it("should not have items with any empty properties", function () {
           items.forEach(item => {
               expect(item.name.length > 0);
               expect(item.img.length > 0);
               expect(item.relUrl.length > 0);
               expect(item.category.length > 0);
           });
       });



   });
    describe("get item api", function () {
        it("should return the correct information for uncraftables", function (done) {
           rust.getItemByName("High Quality Metal").then(hqm => {
               expect(hqm.name).toEqual("High Quality Metal");
               expect(hqm.img.indexOf("High_Quality_Metal_icon.png")).toNotEqual(-1);
               expect(hqm.type).toEqual("Resources");
               expect(hqm.stackSize).toEqual(100);
               expect(hqm.craftable).toBe(false);
               expect(hqm.craftSeconds).toBe(null);
               expect(hqm.craftMats).toBe(null);
               expect(hqm.desc).toEqual("High Quality Metal is a resource that is obtained by smelting High Quality Metal Ore in a Furnace. Small amounts of High Quality Metal can also be found from Loot Crates.");
               done();
           });
       });

        it("should return the correct information for craftables", function (done){
            rust.getItemByName("Low Grade Fuel").then(lg => {
                let recipe = [
                    {name: "Animal Fat", qty: 3},
                    {name: "Cloth", qty: 1}
                ];


                expect(lg.name).toEqual("Low Grade Fuel");
                expect(lg.img.indexOf("Low_Grade_Fuel_icon.png")).toNotEqual(-1);
                expect(lg.type).toEqual("Resources");
                expect(lg.stackSize).toEqual(500);
                expect(lg.craftable).toBe(true);
                expect(lg.craftSeconds).toEqual(5);
                expect(lg.craftMats.length).toEqual(2);
                expect(lg.craftMats).toEqual(recipe);
                expect(lg.desc).toEqual("Low Grade Fuel is a type of refined resource made from Animal Fat and Cloth. Low Grade Fuel is required to craft the Furnace, Lantern, and Explosives, as well as Medical Syringes, Torches and other objects. It is also, as the name suggests, a fuel source and is usable in Mining Quarries, Lanterns and Pump Jacks (formerly also Camp fires, Small Oil Refineries and Furnaces). There are three ways to obtain Low Grade Fuel: crafting it, refining Crude Oil via the Small Oil Refinery, or finding it in artificial loot drops like barrels.");

                done();
            });
        });

        it("should give the correct information for a complicated craftable, like AK", function (done){
            rust.getItemByName("Assault Rifle").then(ak => {

                let recipe = [
                    {name : "High Quality Metal", qty: 50},
                    {name : "Wood", qty: 200},
                    {name : "Rifle Body", qty: 1},
                    {name : "Metal Spring", qty: 4}
                ];


                expect(ak.name).toEqual("Assault Rifle");
                expect(ak.img.indexOf("Assault_Rifle_icon.png")).toNotEqual(-1);
                expect(ak.type).toEqual("Ranged Weapon");
                expect(ak.stackSize).toEqual(1);
                expect(ak.craftable).toBe(true);
                expect(ak.craftSeconds).toEqual(180);
                expect(ak.craftMats.length).toEqual(4);
                expect(ak.craftMats).toEqual(recipe);
                expect(ak.desc).toEqual("The Assault Rifle, commonly referred to as an AK or misleadingly referred to as AK-47 or the AK-74 (which use 7.62 and 5.45 respectively), is an automatic ranged weapon that can fire all 5.56 Rifle Ammo variants. The Assault Rifle is quite expensive, but has a great rate of fire, and well-rounded damage and range. The Assault Rifle is best effective at close to medium range. However, it does have a large amount of recoil.");


                done();
            });

        });

        it("should give an error for an invalid item name", function (done){
            rust.getItemByName("Some item that doesn't exist").then(bullshit => {
                expect(bullshit).toEqual({"Error" : "Item not found"});
                done();
            });
        });
    });
});


function getItemByName(items, name) {
    return items.filter((item) => {
        return item.name === name;
    })[0];
}