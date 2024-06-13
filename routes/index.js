var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
const ytdl = require('ytdl-core');
const path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// Searching route here 

router.post('/search', async (req, res) => {
  const videoURL = req.body.link;

  if (!ytdl.validateURL(videoURL)) {
    return res.status(400).send('Invalid YouTube URL');
  }

  try {
    const info = await ytdl.getInfo(videoURL);
    const thumbnail = info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url;
    const title = info.videoDetails.title;

    res.json({ title, thumbnail, videoURL });
  } catch (error) {
    res.status(500).send('Error fetching video info');
  }
});

// Video Downloading route here 

router.post('/download', async (req, res) => {
  const videoURL = req.body.link;
  const quality = req.body.quality;

  if (!ytdl.validateURL(videoURL)) {
    return res.status(400).send('Invalid YouTube URL');
  }

  try {
    const info = await ytdl.getInfo(videoURL);
    const title = info.videoDetails.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);

    ytdl(videoURL, {
      format: 'mp4',
      quality: 'highestvideo',
      filter: (format) => format.container === 'mp4' && format.hasAudio && format.qualityLabel === quality
    }).pipe(res);
  } catch (error) {
    res.status(500).send('Error downloading video');
  }
});

module.exports = router;
