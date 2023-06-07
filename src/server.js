const express = require("express");
const fetcher = require("./fetcher");

const app = express();
app.use(express.json());

app.post("/parse", async (req, res) => {
  const { domainName } = req.body;

  try {
    const mainPageContent = await fetcher.fetch(domainName);

    const links = mainPageContent.match(/href="([^"]*)"/g).map((link) => {
      return link.replace('href="', "").replace('"', "");
    });

    for (let i = 0; i < links.length; i++) {
      const link = links[i];

      try {
        const content = await fetcher.fetch(link);


        const newLinks = content.match(/href="([^"]*)"/g).map((newLink) => {
          return newLink.replace('href="', "").replace('"', "");
        });
        links.push(...newLinks);
      } catch (error) {
        console.error(`Error fetching ${link}:`, error.message);
      }
    }

    const uniqueLinks = [...new Set(links)];
    res.send(uniqueLinks);
  } catch (error) {
    console.error(`Error fetching ${domainName}:`, error.message);
    res.status(500).send("Internal server error");
  }
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
