import { expect, test } from "@playwright/test";
const example = "A dinner date in Manchester on a chilly evening, smart casual but not overly formal.";
const pieces = [
 {name:"Navy tailored blazer",owned:false,note:"Tailored layer"},
 {name:"Ivory Oxford shirt",owned:false,note:"Soft contrast"},
 {name:"Charcoal tailored trousers",owned:false,note:"Clean leg"},
 {name:"Dark brown penny loafers",owned:false,note:"Polished footwear"},
];
test("single demo journey: example, generate, swap shoes, save, reopen", async ({page},info)=>{
 await page.setViewportSize({width:390,height:844});
 const requests: string[]=[];
 await page.route("**/api/stylist",async route=>{
  const body=JSON.parse(route.request().postData()??"{}");requests.push(body.request??"");
  const swap=(body.request??"").includes('replace the piece "Dark brown penny loafers"');
  await route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({status:"ready",data:{
   verdict:"Wear",title:swap?"The considered evening, refined":"The considered evening",
   summary:"A cohesive smart-casual evening look",reasons:["Balanced tailoring and footwear"],
   pieces:swap?[...pieces.slice(0,3),{name:"Black leather Chelsea boots",owned:false,note:"Weather ready"}]:pieces
  }})});
 });
 await page.goto("/?view=Discover");
 await page.getByRole("button",{name:"Use an example"}).click();
 await expect(page.getByRole("textbox",{name:"Describe your occasion"})).toHaveValue(example);
 await page.screenshot({path:info.outputPath("01-home.png")});
 await page.getByRole("button",{name:"Style my look"}).click();
 await expect(page.getByRole("heading",{name:"The considered evening",exact:true})).toBeVisible();
 expect(requests).toHaveLength(1);
 await page.screenshot({path:info.outputPath("02-look.png")});
 await page.getByRole("button",{name:"Change Dark brown penny loafers"}).first().click();
 await page.getByRole("button",{name:/Swap "Dark brown penny loafers"/}).click();
 await expect(page.getByRole("heading",{name:"The considered evening, refined"})).toBeVisible();
 expect(requests).toHaveLength(2);
 const current=await page.evaluate(()=>JSON.parse(localStorage.getItem("stylebender-current-outfit")??"{}"));
 expect(current.version).toBe(2);
 expect(current.pieces.map((x:{name:string})=>x.name)).toEqual([...pieces.slice(0,3).map(x=>x.name),"Black leather Chelsea boots"]);
 await page.locator(".mobile-verdict-actions").getByRole("button",{name:"Save",exact:true}).click();
 await page.getByRole("navigation",{name:"Primary"}).getByRole("button",{name:"Saved",exact:true}).click();
 await expect(page.getByRole("heading",{name:"The considered evening, refined"})).toBeVisible();
 await page.screenshot({path:info.outputPath("03-saved.png")});
 await page.reload();
 await page.getByRole("button",{name:/Reopen/}).click();
 await expect(page.getByRole("heading",{name:"The considered evening, refined"})).toBeVisible();
 expect(requests).toHaveLength(2);
});
