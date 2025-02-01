const fs = require("fs");
const dirs = fs.readdirSync("./src/api").filter((el) => el !== ".gitkeep");

let result = "";
dirs.forEach((dir) => {
  const fileContent = fs.readFileSync(
    `./src/api/${dir}/content-types/${dir}/schema.json`
  );

  result += `\n${fileContent}`;
});

fs.writeFileSync("./all-types.txt", result);
