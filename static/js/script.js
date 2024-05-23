document.addEventListener('DOMContentLoaded', function () {
            
    var videoContainer = document.getElementById('videoContainer');
    var video = document.getElementById('video');
    var snapBtn = document.getElementById('snap-btn');
    var retakeBtn = document.getElementById('retake-btn');
    var resultDiv = document.getElementById('result');
    var movieDiv = document.getElementById('mov');
    var textDiv = document.getElementById('text');
    var popup = document.getElementById('popup');
    const title = document.getElementById('title');
    const recommendBtn = document.getElementById('recommendBtn');
    const closeMovie = document.getElementById('closeMovie');
    const movieList = document.getElementById('movieList');
    const trailer = document.getElementById('trailer');
    const closeTrailer = document.getElementById('closeTrailer');
    var head = document.getElementById('header');
    var menu1 = document.getElementById('menu1');
    var menu2 = document.getElementById('menu2');
    const menu3 = document.getElementById('menu3');

    var flag = 0;
    var flag1 = 0;
    $(document).ready(function () {
        var cameraActive = false;

        $("#toggleBtn").click(function () {
            if (cameraActive) {
                $.ajax({
                    type: "POST",
                    url: "/stop_camera",
                    success: function (response) {
                        console.log(response.message);
                        $("#videoFeed").attr("src", "");
                        $("#toggleBtn").text("Start Camera");
                        videoContainer.style.display = 'none';
                        snapBtn.style.display = 'none';
                        retakeBtn.style.display = 'none';
                        resultDiv.style.display='none';
                        recommendBtn.style.display='none';
                        closeMovie.style.display='block';
                        textDiv.style.display='block';
                        title.style.display='block';
                        menu1.style.display = 'none';
                        menu2.style.display = 'block';
                        menu3.style.display = 'none';
                        
                        if (flag === 0) {
                            movieDiv.style.display = 'none';
                            head.style.display = 'none'; // Display the element if flag is 0
                        } else {
                            title.style.display = 'none';
                            movieDiv.style.display = 'block';
                            head.style.display = 'block'; // Hide the element if flag is not 0
                        }
                        if (flag1 === 0) {
                            movieDiv.style.display = 'none';
                            head.style.display = 'none'; 
                            menu3.style.display = 'none';
                            // Display the element if flag is 0
                        } else {
                            title.style.display = 'none';
                            menu3.style.display = 'block';

                            movieDiv.style.display = 'block';
                            head.style.display = 'block'; // Hide the element if flag is not 0
                        }
                        if (flag1 === 0 && flag === 1) {
                            title.style.display = 'none';
                            menu2.style.display = 'block';

                            movieDiv.style.display = 'block';
                            head.style.display = 'block'; // Hide the element if flag is not 0
                        }
                        cameraActive = false;
                    },
                    error: function (xhr, status, error) {
                        console.error("Error stopping camera: " + error);
                    }
                });
            } else {
                $.ajax({
                    type: "POST",
                    url: "/start_camera",
                    success: function (response) {
                        console.log(response.message);
                        $("#videoFeed").attr("src", "/video_feed");
                        $("#toggleBtn").text("Stop Camera");
                        videoContainer.style.display = 'block';
                        snapBtn.style.display = 'block';
                        textDiv.style.display='none';
                        head.style.display = 'block';
                        menu1.style.display = 'block';
                        title.style.display='none';
                        movieDiv.style.display = 'none';
                        menu2.style.display = 'none';
                        menu3.style.display = 'none';
                        popup.style.display = 'none';
                        trailer.style.display = 'none';
                        flag=0;
                        flag1=0;
                        cameraActive = true;
                    },
                    error: function (xhr, status, error) {
                        console.error("Error starting camera: " + error);
                    }
                });
            }
        });
    });
 
    snapBtn.addEventListener('click', function () {
        fetch('/detect_emotion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            
        })
        .then(response => response.json())
        .then(data => {
            if (data.current_emotion_label) {
                resultDiv.style.display='block';
                resultDiv.innerHTML = 'Detected Emotion: ' + data.current_emotion_label;
                retakeBtn.style.display = 'inline-block';
                recommendBtn.style.display='inline-block';
                movieDiv.style.display = 'block';
                movieList.style.display='none';
                closeMovie.style.display='none';
                snapBtn.style.display = 'none';

        // Update background color based on emotion
        switch (data.current_emotion_label) {
        case 'Happy':
            resultDiv.style.backgroundColor = '#008000'; // Green
            break;
        case 'Sad':
            resultDiv.style.backgroundColor = '#4B0082'; // Indigo
            break;
        case 'Angry':
            resultDiv.style.backgroundColor = '#8B0000'; // Dark red
            break;
        case 'Neutral':
            resultDiv.style.backgroundColor = '#808080'; // Gray
            break;
        case 'Surprised':
            resultDiv.style.backgroundColor = '#FFD700'; // Gold
            break;
        case 'Fear':
            resultDiv.style.backgroundColor = '#FFA500'; // Orange
            break;
        case 'Disgusted':
            resultDiv.style.backgroundColor = '#8A2BE2'; // Blue violet
            break;
        default:
            resultDiv.style.backgroundColor = '#080808'; // Default color
    }
                
            } else {
                resultDiv.innerText = 'No emotion detected';
                retakeBtn.style.display = 'inline-block';
                snapBtn.style.display = 'none';
            }
        })
        .catch(error => console.error('Error:', error));
    });
    
    closeMovie.addEventListener('click', function () {
        flag = 0;
        title.style.display = 'block'
        head.style.display = 'none';
        popup.style.display='none';
        trailer.style.display = 'none';
        movieDiv.style.display = 'none';
        menu2.style.display = 'none';

    });
    retakeBtn.addEventListener('click', function () {
        resultDiv.innerHTML = '';
        retakeBtn.style.display = 'none';
        resultDiv.style.display='none';
        menu2.style.display = 'none';
        snapBtn.style.display = 'inline-block';
        recommendBtn.style.display='none';
        movieList.style.display='none';
        popup.style.display='none';
        trailer.style.display = 'none';
        flag=0;
        flag1=0;
        // Reset the video feed
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function (stream) {
                video.srcObject = stream;
            })
            .catch(function (error) {
                console.error('Error accessing the camera:', error);
            });
    });
    

    recommendBtn.addEventListener('click', function() {
        fetch('/recommend', {
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
            if (data.movies && data.movies.length > 0) {
                flag = 1;
                movieList.style.display='inline-block';
                menu2.style.display = 'block';
                menu3.style.display = 'none';
                movieList.innerHTML = '';
                data.movies.forEach(movie => {
                    const movieElement = document.createElement('div');
                    
                    // Add a click event listener to the movieElement
                    movieElement.addEventListener('click', function() {
                        // Fetch movie details from TMDb API
                        fetch(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=9ea1d53c7f38b94b509fdd2ccade0721`)
                        .then(response => response.json())
                        .then(movieDetails => {
                            trailer.style.display = 'none';
                            // Populate the popup with fetched movie details
                            populatePopup(movieDetails);
                            // Show the popup
                            document.getElementById('popup').style.display = 'flex'; // Change display to 'flex'
                            // Set the background image of the popup content
                            document.querySelector('.popup').style.backgroundImage = `url(https://image.tmdb.org/t/p/original${movieDetails.backdrop_path})`;
                            document.querySelector('.popup').style.backgroundSize = 'cover';
                            document.querySelector('.popup').style.backgroundPosition = 'center';
                        })
                        .catch(error => {
                            console.error('Error fetching movie details:', error);
                            // Handle error
                        });
                    });
                    
                    // Set cursor style to pointer to indicate the element is clickable
                    movieElement.style.cursor = 'pointer';
                    
                    // Populate the movieElement with movie title and image
                    movieElement.innerHTML = `
                        <h3>${movie.title}</h3>
                        <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
                    `;
                    
                    // Append the movieElement to the movieList container
                    movieList.appendChild(movieElement);
                });
                
            } else {
                movieList.innerHTML = 'No movie recommendations found.';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            movieList.innerHTML = 'Failed to fetch movie recommendations.';
        });
    });
    
    function populatePopup(movie) {
        // Populate movie details in the popup
        document.getElementById('movieTitle').textContent = movie.title;
        document.getElementById('moviePoster').src = "https://image.tmdb.org/t/p/w500" + movie.poster_path;
        document.getElementById('movieRating').textContent = "Rating: " + movie.vote_average;
        document.getElementById('movieGenres').textContent = "Genres: " + movie.genres.map(genre => genre.name).join(", ");
        document.getElementById('movieOverview').textContent = "Overview: " + movie.overview;

        const movieId = movie.id;
        var totalMinutes = movie.runtime;
        var hour = Math.floor(totalMinutes/60);
        var minutes = totalMinutes%60;
        document.getElementById('movieDuration').textContent = "Duration: " + hour + "h " + minutes + "m";

        // Remove any existing event listeners from the "More" button
        const moreButton = document.getElementById('more');
        const newMoreButton = moreButton.cloneNode(true);
        moreButton.parentNode.replaceChild(newMoreButton, moreButton);
    
        const API_KEY = '9ea1d53c7f38b94b509fdd2ccade0721'; 
    
        // Function to fetch trailer data from TMDb API
        async function fetchTrailer(movieId) {
            try {
                const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${API_KEY}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch trailer data.');
                }
                const data = await response.json();
                return data.results;
            } catch (error) {
                throw new Error(`Error fetching trailer data: ${error.message}`);
            }
        }
    
        // Function to display trailer video
        function displayTrailer(videoKey) {
            const trailerContainer = document.getElementById('trailer-container');
            trailerContainer.innerHTML = `
                <iframe width="560" height="315" src="https://www.youtube.com/embed/${videoKey}?autoplay=1" frameborder="0" allowfullscreen></iframe>
            `;
            
        }
        // Add event listener to play button with movieId as a parameter
        document.getElementById('play').addEventListener('click', async () => {
            trailer.style.display = 'inline-block';
            flag1 = 1;
            menu3.style.display = 'block';
            
            try {
                const trailers = await fetchTrailer(movieId);
                const trailer = trailers.find(trailer => trailer.type === 'Trailer' && trailer.site === 'YouTube');
                if (trailer) {
                    displayTrailer(trailer.key);
                } else {
                    throw new Error('No trailer found for this movie.');
                }
            } catch (error) {
                console.error('Error fetching or displaying trailer:', error.message);
            }
        });

        // Add event listener to "More" button
        document.getElementById('more').addEventListener('click', function() {
        // Open a new window with more details about the movie
        const movieUrl = `https://www.themoviedb.org/movie/${movie.id}-${movie.title.toLowerCase().replace(/\s+/g, '-')}`;
        window.open(movieUrl, '_blank');
    });
    }
    
    
    // Close the popup when the close button is clicked
    document.getElementById('closePopup').addEventListener('click', function() {
        document.getElementById('popup').style.display = 'none';
        trailer.style.display = 'none';
        //closeTrailer();
    });

    // Function to close the trailer
    closeTrailer.addEventListener('click', function () {
        flag1 = 0;
        
        trailer.style.display = 'none';
        menu3.style.display = 'none';

        const trailerContainer = document.getElementById('trailer-container');
        const iframe = trailerContainer.querySelector('iframe');
        iframe.src = ''; // Stop video playback
    });
   
});

function scrollToTop() {
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
    });
}