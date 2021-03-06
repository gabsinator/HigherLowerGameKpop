
window.onload = function() {

    main = function() {
        const delay = ms => new Promise(res => setTimeout(res, ms));
        //objects to store whats in choices
        var choice_1 = {
            "choice": 1,
            "title": null,
            "url": null,
            "views": null,
            "thumbnail": null
        };

        var choice_2 = {
            "choice": 2,
            "title": null,
            "url": null,
            "views": null,
            "thumbnail": null
        };

        var used_songs = [];
        var played = false;
        var score = 0;

        const footer = document.querySelector("footer");
        const creds_box = document.getElementById("credits-div");
        const game_over_screen = document.getElementById("game_over_screen");
        const my_switch = document.getElementsByClassName("switch")[0];
        const my_switch_input = my_switch.getElementsByTagName("input")[0];

        const correct_sound = new Audio("/res/sound/correct.mp3");
        const incorrect_sound = new Audio("/res/sound/incorrect.wav");

        game_over_screen.style = "null";

        let cross = document.querySelectorAll('.cross');

        for (var i=0; i<cross.length; i++) {
            cross[i].style.display = "none";
        }

        let score_counters = document.getElementsByClassName("score-counter");

        for (var i=0; i<score_counters.length; i++) {
            score_counters[i].innerHTML = `Score: ${score}`;
        }

        function getRandomInt(max) {
            return Math.floor(Math.random() * max);
        }

        reset_creds = function() {
            creds_box.style = "null";
            footer.getElementsByClassName("credits-btn")[0].style.visibility = "visible";

        }
        

        show_creds = function() {
            creds_box.style.display = "inline";
            footer.getElementsByClassName("credits-btn")[0].style.visibility = "hidden";
        }

        updateSound = function() {
            if(my_switch_input.checked) {
                
                correct_sound.volume = 0.2;
                incorrect_sound.volume = 0.2;
            } else {

                correct_sound.volume = 0;
                incorrect_sound.volume = 0;
            }
        }

        my_switch.addEventListener("click", updateSound);

        updateSound();

        get_song = function(choice = String, callback) {
            fetch("songs.json")
                .then(response => response.json())
                .then(json => {

                    check_if_used = function() {

                        var len = json.length;
                        var n = getRandomInt(len);
                        console.log(json[n]);

                        if(used_songs.indexOf(json[n]) >= 0) {
                            console.log("doppelg??nger");
                            check_if_used();
                        }
        
                        else {
                            console.log("kein doppelg??nger");
                            used_songs.push(json[n]);
                            callback(choice, json[n]);
                        }
                        console.log(used_songs);
                    }
                    check_if_used();
                    
                });

        }
        
        document.getElementById("demo").innerHTML = "IN GAME";


        create_id = function(yt_url = String) {
            var id = yt_url.substr(-11);
            return id;
        }

        
        fillData = function(choice = String, url) {

            

            var div = document.getElementById(choice);
            var viewcount = div.getElementsByClassName("viewCount")[0];
            viewcount.style.visibility = "hidden";
            document.getElementById("checkmark").style.display = "none";

            var choices = document.getElementsByClassName('choices');

            for (var i=0; i<choices.length; i++) {
                choices[i].style = "null";
            }

            var request_url = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2Cstatistics&id=${create_id(url)}&key=${YOUTUBE_API_KEY}`;
            var choice_div = document.getElementById(choice);

            fetch(request_url)
                .then(response => response.json())
                .then(data => {

                    var title = data.items[0].snippet.title;
                    var views = data.items[0].statistics.viewCount;
                    
                    try {
                        var thumbnail = data.items[0].snippet.thumbnails.maxres.url;
                    }
                    catch(err) {
                        var thumbnail = data.items[0].snippet.thumbnails.medium.url;
                        console.log(err);
                    }
                    
                    if(choice == "choice-1") {
                        choice_1.title = title;
                        choice_1.url = url;
                        choice_1.views = views;
                        choice_1.thumbnail = thumbnail;
                    }
                    else if(choice == "choice-2") {
                        choice_2.title = title;
                        choice_2.url = url;
                        choice_2.views = views;
                        choice_2.thumbnail = thumbnail;
                    }

                    console.log(data);

                    //put title in div using js
                    choice_div.getElementsByClassName("title")[0].innerHTML = title;
                    choice_div.getElementsByClassName("thumbnail")[0].src = thumbnail;

                    //now u can play again
                    played = false;

                });
        }

        get_song("choice-1", fillData);
        get_song("choice-2", fillData);

        //checks wether control is pressed
        check_control = function(event) {
            if(event.ctrlKey) {
                return true;
            }
            else {
                return false;
            }
        }

        //opens url in new tab
        openInNewTab = function(url) {
            window.open(url, '_blank').focus();
        }

        show_views = () => {
            //show viewcount for both MVs
            //document.getElementsByClassName("viewCount")[0].innerHTML = `views: ${choice_1.views}`;
            //document.getElementsByClassName("viewCount")[1].innerHTML = `views: ${choice_2.views}`;
            
            document.getElementsByClassName("viewCount")[0].setAttribute('data-target', choice_1.views);
            document.getElementsByClassName("viewCount")[1].setAttribute('data-target', choice_2.views);

            // Selector
            const counters = document.querySelectorAll('.viewCount');
            // Main function
            for(let n of counters) {
                const updateCount = () => {
                    const target = + n.getAttribute('data-target');
                    const count = + n.innerText.replace("views: ", "");
                    const speed = 100; // change animation speed here
                    const inc = target / speed;

                    if(count < target) {
                        var r = Math.ceil(count + inc);
                        n.innerText = `views: ${r}`;
                        setTimeout(updateCount, 1);
                    } else {
                        n.innerText = `views: ${target}`;
                    }
                }
                updateCount();
            }

            var choices = document.getElementsByClassName('viewCount');

            for (var i=0; i<choices.length; i++) {
                choices[i].style.visibility = 'visible';
            }


        }

        win = async (choice) => {

            console.log("W");
            score++;
            
            let score_counters = document.getElementsByClassName("score-counter");

            for (var i=0; i<score_counters.length; i++) {
                score_counters[i].innerHTML = `Score: ${score}`;
            }

            document.getElementById("checkmark").style.display = "block";
            correct_sound.play();

            await delay(3000);

            //load new MV for choice with less views
            if(choice == 1) {
                get_song("choice-1", fillData);
            }
            else if(choice == 2) {
                get_song("choice-2", fillData);
            }
            else {
                console.log("FATAL ERROR");
            }

        }

        game_over = () => {
            console.log("L");

            let cross = document.querySelectorAll('.cross');
            incorrect_sound.play();

            for (var i=0; i<cross.length; i++) {
                cross[i].style.display = "block";
            }

            game_over_screen.style.transition = "0.5s ease 1s";

            game_over_screen.style.visibility = "visible";
            game_over_screen.style.opacity = "1";
        }

        check_higer_views = function(choice) {

            console.log(`choice 1: ${choice_1.views}`);
            console.log(`choice 2: ${choice_2.views}`);

            if(Number(choice_1.views) == Number(choice_2.views)) {
                console.log("WTF DRAW");
            }
            else {
                //choice1 has a higer viewcount
                if(Number(choice_1.views) > Number(choice_2.views)) {
                    console.log("choice 1 has more views");
                    document.getElementById("choice-1").style.borderColor = "#a700a7";

                    if(choice == choice_1.choice) {
                        win(2);
                    }
                    else {
                        game_over();
                    }
                }
                //choice2 has a higher viewcount
                else {
                    console.log("choice 2 has more views");
                    document.getElementById("choice-2").style.borderColor = "#a700a7";

                    if(choice == choice_2.choice) {
                        win(1);
                    }
                    else {
                        game_over();
                    }
                }
            }

            
        }

        //this function is called when a choice is picked
        choice_clicked = function(choice_div, event, choice) {



            if(!played) {

                
                

                //if strg is pressed open MV link
                if(check_control(event)) {

                    if(choice == 1) {
                        var link = choice_1.url;
                    } else if(choice == 2) {
                        var link = choice_2.url;
                    }

                    openInNewTab(link);
                }
                else {
                    //you played already
                    played = true;
                    reset_creds();

                    let title = choice_div.getElementsByClassName("title")[0].innerHTML;
                    document.getElementById("demo").innerHTML = title;

                    show_views();
                    
                    check_higer_views(choice);

                }

            }
            else {
                console.log("you played already!");
            }

        }
    }

    main();
    
}

