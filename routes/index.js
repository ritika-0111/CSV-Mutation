const express = require('express');
const router = express.Router();
var path = require("path");
var multer = require("multer");
const fs = require('fs');


// Declaring multer for uploading files
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + "new" + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });


// Home route
router.get("/", (req, res) => {
    let utterance;
    let url = req.protocol + '://' + req.get('host');
    res.render("upload", { utterance, url });
});

// Post route for uploading csv
router.post('/uploadcsv', upload.single('csv'), (req, res) => {
    let file = req.file.path;
    console.log("uploaded");
    return res.send({ file });
});

// Display CSV file in editable format
router.get("/csvfile", (req, res) => {
    let file = "public/uploads/csv-new.csv";
    let fileString = fs.readFileSync(file, "utf-8");
    let utterance = []
    let subtopic = []
    let types = []
    let dialogact = []
    let emotion = []
    let id = []
    let row = ''
    for (let i = 0; i <= fileString.split('\r\n').length; i++) {
        row = fileString.split('\r\n')[i]
        //  console.log("row", row);
        if (typeof row == "undefined" || row == "")
            break

        if (row[0] == '"') {
            let word = row.lastIndexOf('"')
            let str = row.substr(0, word + 1);
            utterance.push(str.replace(/['"]+/g, ''));
            let senti = row.substr(word + 2,)

            subtopic.push(senti.split(',')[0])
            id.push(senti.split(',')[1])
            types.push(senti.split(',')[2])
            dialogact.push(senti.split(',')[3])
            emotion.push(senti.split(',')[4])

        } else {
            utterance.push(row.split(',')[0])
            subtopic.push(row.split(',')[1])
            id.push(row.split(',')[2])
            types.push(row.split(',')[3])
            dialogact.push(row.split(',')[4])
            emotion.push(row.split(',')[5])
        }
    }

    res.render("home", { utterance, subtopic, types, dialogact, emotion, id });
});

// Post route to add subtopic
router.post('/addSentiment', (req, res, next) => {
    let reqid = req.body.id;
    console.log("data, id", reqid);
    let file = "public/uploads/csv-new.csv";
    let fileString = fs.readFileSync(file, "utf-8");
    let data = ""
    let row = ''
    let utterance = []
    let subtopic = []
    let types = []
    let dialogact = []
    let emotion = []
    let id = []
    fs.writeFileSync(file, data)
    console.log('result', fileString.split('\r\n').length);
    for (let i = 0; i < fileString.split('\r\n').length; i++) {
        row = fileString.split('\r\n')[i]
        if (typeof row == "undefined" || row == "")
            break
        (function (i) {
            if (row[0] == '"') {
                let word = row.lastIndexOf('"')
                let str = row.substr(0, word + 1);
                utterance = str;
                let senti = row.substr(word + 2,)

                if (i == reqid) {
                    subtopic = req.body.sentiment
                } else {
                    subtopic = senti.split(',')[0]
                }

                id = senti.split(',')[1];
                types = senti.split(',')[2];
                dialogact = senti.split(',')[3];
                emotion = senti.split(',')[4];
            } else {
                if (i == reqid) {
                    subtopic = req.body.sentiment
                } else {
                    subtopic = row.split(',')[1]
                }
                utterance = row.split(',')[0];
                id = row.split(',')[2];
                types = row.split(',')[3];
                dialogact = row.split(',')[4];
                emotion = row.split(',')[5];
            }

            data = `${utterance},${subtopic},${id},${types},${dialogact},${emotion}\r\n`
            fs.appendFileSync(file, data)
        })(i)
    }
    res.redirect("/csvfile");
});

router.post('/editcsv', (req, res) => {
    let edit = req.body;
    let file = "public/uploads/csv-new.csv";
    let fileString = fs.readFileSync(file, "utf-8");
    let data = ""
    let row = ''
    let utterance = []
    let subtopic = []
    let types = []
    let dialogact = []
    let emotion = []
    let id = []
    let reqid = []
    let value = []
    fs.writeFileSync(file, data)
    for (var key in edit) {
        // console.log("edit", key);
        reqid.push(key);
        // console.log("edit", edit[key]);
        value.push(edit[key]);

    }
    console.log("check", reqid[4])
    for (let i = 0; i < fileString.split('\r\n').length; i++) {
        row = fileString.split('\r\n')[i]
        if (typeof row == "undefined" || row == "")
            break
        (function (i) {
            console.log("check", row[0])

            if (row[0] == '"') {
                let word = row.lastIndexOf('"')
                let str = row.substr(0, word + 1);
                utterance = str;
                let senti = row.substr(word + 2,)

                if ((reqid[i]) && (i == reqid[i])) {
                    subtopic = value[i]
                } else {
                    subtopic = senti.split(',')[0]
                }

                id = senti.split(',')[1];
                types = senti.split(',')[2];
                dialogact = senti.split(',')[3];
                emotion = senti.split(',')[4];
            } else {
                if ((reqid[i]) && (i == reqid[i])) {
                    subtopic = value[i]
                } else {
                    subtopic = row.split(',')[1]
                }
                utterance = row.split(',')[0];
                id = row.split(',')[2];
                types = row.split(',')[3];
                dialogact = row.split(',')[4];
                emotion = row.split(',')[5];
            }
            console.log("subtopic", subtopic);

            data = `${utterance},${subtopic},${id},${types},${dialogact},${emotion}\r\n`
            fs.appendFileSync(file, data)
        })(i)
    }
    res.redirect("/csvfile");
});

// export csv file, 
router.post('/exportcsv', (req, res) => {
    let summary = req.body.summary;
    let primary = req.body.primary_topic;
    let secondary = req.body.secondary_topic;
    let len = req.body.csv_length;
    let file = "public/expcsv/new.csv";
    let utterance = []
    let subtopic = []
    let types = []
    let dialogact = []
    let emotion = []
    let id = []
    let data = ""
    let head = "summary,primary_topic,secondary_topic";
    let value = summary + "," + primary + "," + secondary;
    let path = "public/uploads/csv-new.csv";
    let fileString = fs.readFileSync(path, "utf-8");
    for (let i = 0; i <= fileString.split('\r\n').length; i++) {
        row = fileString.split('\r\n')[i]
        console.log("row", row)
        if (typeof row == "undefined" || row == "")
            break
        if (row[0] == '"') {
            let word = row.lastIndexOf('"')
            console.log("wodddd", row.substr(0, word));
            let str = row.substr(0, word + 1);
            utterance.push(str);
            let senti = row.substr(word + 2,)

            subtopic.push(senti.split(',')[0])
            id.push(senti.split(',')[1])
            types.push(senti.split(',')[2])
            dialogact.push(senti.split(',')[3])
            emotion.push(senti.split(',')[4])

        } else {
            utterance.push(row.split(',')[0])
            subtopic.push(row.split(',')[1])
            id.push(row.split(',')[2])
            types.push(row.split(',')[3])
            dialogact.push(row.split(',')[4])
            emotion.push(row.split(',')[5])
        }

    }
    for (let l = 0; l < 3; l++) {
        utterance.push(head.split(',')[l])
        subtopic.push(value.split(',')[l])
        id.push("")
        types.push("")
        dialogact.push("")
        emotion.push("")
    }


    fs.writeFileSync(file, data);
    //console.log("utttt", utterance);
    console.log("sentt", subtopic);
    for (let k = 0; k < len + 3; k++) {
        (function (k) {
            if (utterance[k] != undefined) {

                utter = utterance[k];
                senti = subtopic[k];
                ids = id[k];
                type = types[k];
                dialogs = dialogact[k];
                emotions = emotion[k];
                data = `${utter},${senti},${ids},${type},${dialogs},${emotions}\r\n`

                fs.appendFileSync(file, data)
            }
        })(k)
    }
    res.download(file);
});

module.exports = router;
