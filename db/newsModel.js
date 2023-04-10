const mongoose = require("mongoose");
const moment = require("moment");
const fetch = (url) => import('node-fetch').then(({default: fetch}) => fetch(url));
const previousWeek = moment().subtract(7, "days").format("YYYY-MM-DD");

const NewsSchema = new mongoose.Schema({
  uuid: {
    type: String,
    required: true,
    unique: false,
  },
  title: {
    type: String,
    required: true,
    unique: false,
  },

  image_url: {
    type: String,
    required: true,
    unique: false,
  },
  url: {
    type: String,
    required: true,
    unique: false,
  },
  description: {
    type: String,
    required: false,
    unique: false,
  },
  number: {
    type: Number,
    required: false,
    unique: true,
  },
});

const News = mongoose.model.News || mongoose.model("News", NewsSchema);

async function getNews() {
  await News.collection.deleteMany({});
  console.log("Accessing News DB");
  let y = 1;
  for (let x = 1; x < 4; x++) {
    const myNews = await fetch(
      `https://api.marketaux.com/v1/news/all?exchanges=CCY&filter_entities=true&published_after=${previousWeek}T12:31&page=${x}&language=en&api_token=cVj44lWPeI7MnaEVMZRblYyzdvrpTb1QzZmsZkUC`
    );

    const response = await myNews.json();
    for (let i = 0; i < response.data.length; i++) {
      const news = new News({
        uuid: response.data[i].uuid,
        title: response.data[i].title,
        image_url: response.data[i].image_url,
        url: response.data[i].url,
        description: response.data[i].description,
        number: y,
      });

      await news.save();
      y++;
    }
  }
}

getNews();
module.exports = News;
