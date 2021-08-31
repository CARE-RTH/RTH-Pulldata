let intervalID = null;
let dataSent = false;

window.addEventListener("message", m => {
    //We're only interested in data coming from the survey service.
    if(m.origin != "https://httuit.qualtrics.com")
        return;
    
    //Make sure the data is something sensible and not something random
    //Don't know the inner workings of qualtrics, that's why we check this.
    if(m.data == "DATA RECEIVED") {
        //Mark the data as sent to prevent duplicate messages
        dataSent = true;
        //Clear the interval as well, don't waste time
        clearInterval(intervalID);
        //Switch over to the checkmark and a complete message.
        document.getElementById("spinner").style.display = "none";
        document.getElementById("check").style.display = "block";
        document.getElementById("status").innerHTML = "Data upload complete, you can now continue the survey";
    }
});

document.addEventListener("load", () => {
    //Check if the game data is present, and send it if it is, every three seconds.
    intervalID = setInterval(pollUpdate, 3000);
});

function pollUpdate() {
    console.log("POLLING");
    //If there is no game data present, skip this cycle
    let data = window.localStorage.getItem("gamedata");
    if(data == null)
        return;

    //Make data JSON
    data = JSON.parse(data);
    
    //Check if there is a data label present
    //If it is then we have to label all our data with the given prefix
    const urlParams = new URLSearchParams(window.location.search);
    const labelparam = urlParams.get('label');
    if(labelparam) {
        const unlabeled = data;
        data = {}
        const k = Object.keys(unlabeled);
        for(let i = 0; i < k.length; i++) {
            data[labelparam+k[i]] = unlabeled[k[i]];
        }
    }
    
    //Because this function is called asynchronously we can't guarantee that data hasn't already been sent. Check for that.
    if(dataSent)
        return;
    //Done with data processing, send the stringified JSON data to the parent window (assuming it is the qualtrics survey)
    window.parent.postMessage(JSON.stringify(data), "https://hhtuit.qualtrics.com");
}