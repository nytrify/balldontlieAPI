const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
const balldontlieURL = "https://www.balldontlie.io/api/v1";

app.get("/", (req, res) => {
    res.render("page.ejs");
});

app.post("/", async (req, res) => {
    const firstName = req.body.playerFirstName;
    const lastName = req.body.playerLastName;
    const inpSeason = req.body.season;
    const playerName = firstName +" " +lastName;
    try{
        const firstResponse = await axios.get(balldontlieURL +"/players?search=" +firstName +"_" +lastName);
        const firstResult = firstResponse.data.data[0];
        const playerHeight = firstResult.height_feet +" feet " +firstResult.height_inches +" inches";
        const playerWeight = firstResult.weight_pounds +" pounds";
        const playerID = firstResult.id;

        const secondResponse = await axios.get(balldontlieURL +"/season_averages?season=" +inpSeason +"&player_ids[]=" +playerID);
        const secondResult = secondResponse.data.data[0];
        const fg = (Math.round((secondResult.fg_pct * 100)*100)/100) + "%";
        const fg3 = (Math.round((secondResult.fg3_pct * 100)*100)/100) + "%";

        res.render("page.ejs", {
            name: playerName,
            position: firstResult.position,
            height: playerHeight,
            weight: playerWeight,
            team: firstResult.team.full_name,
            points: secondResult.pts,
            assists: secondResult.ast,
            rebounds: secondResult.reb,
            fieldGoal: fg,
            threePoint: fg3,
            season: inpSeason
        });
    }
    catch(error){
        console.error("There has been a problem in retrieving the player data", error.message);
        res.render("page.ejs", {
            error: error.message
        });
    }
})

app.listen(3000, () => {
    console.log("server up on port 3000");
})