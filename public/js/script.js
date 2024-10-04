{/* <script src="/socket.io/socket.io.js"></script> */}

const socket = io();

if (navigator.geolocation) {
    navigator.geolocation.watchPosition((position) => {
        const { latitude, longitude } = position.coords;
        socket.emit('send-location', { latitude, longitude });
    }, (error) => {
        console.error(error);
        switch (error.code) {
            case error.PERMISSION_DENIED:
                console.error("User denied the request for Geolocation.");
                alert("Please allow location access for the app to work.");
                break;
            case error.POSITION_UNAVAILABLE:
                console.error("Location information is unavailable.");
                alert("Unable to determine your location. Please check your location services.");
                break;
            case error.TIMEOUT:
                console.error("The request to get user location timed out.");
                alert("Location request timed out. Try again.");
                break;
            default:
                console.error("An unknown error occurred.");
                alert("An error occurred while retrieving your location.");
                break;
        }
    },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
}

const map= L.map("map").setView([0,0], 10);
// const map= L.map("map").setView([0,0], 16);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:"Real-Time Tracker"
}).addTo(map);

const markers= {}

socket.on("receive-location", (data)=>{
    const {id, latitude, longitude} = data;
    map.setView([latitude,longitude]);
    if(markers[id]){
        markers[id].setLatLng([latitude, longitude])
    }
    else{
        markers[id]=L.marker([latitude, longitude]).addTo(map);
    }
});

socket.on("user-disconnected", (id)=>{
    if(markers[id]){
        map.removeLayer(markers[id]);
        delete markers[id];
    }
})