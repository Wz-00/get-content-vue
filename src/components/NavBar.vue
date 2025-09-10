<template>
    <div class="container-fluid">
    <nav class="navbar navbar-expand-lg">
        <div class="container-fluid mx-4">
            <a class="navbar-brand text-black" href="/"><img src="/logo.png" alt=""></a>
            <ul class="navbar-nav">
                <li class="nav-item"><router-link to="/youtube" class="link">YouTube Downloader</router-link></li>
                <li class="nav-item"><router-link to="/tiktok" class="link">TikTok Downloader</router-link></li>
                <li class="nav-item"><router-link to="/instagram" class="link">Instagram Downloader</router-link></li>
                <li class="nav-item"><router-link to="/facebook" class="link">Facebook Downloader</router-link></li>
            </ul>
            <div class="d-flex justify-content-end">
                <label class="switch">
                    <input type="checkbox" checked>
                    <span class="slider round"></span>
                </label>
            </div>
        </div>
    </nav>
    </div>
</template>
<script>
</script>
<style scoped>

.navbar {
    position:fixed;
    width: 100%;
    z-index: 9;
    margin: 1rem 0;
    top: -2px;
    background-color: #f5f6fa;
}
.navbar .container-fluid {
    background-color: white;
    padding: 1rem;
    border-radius: 24px;
    box-shadow: 0px 0px 9px 2px rgba(0,0,0,0.1);
}
.link{
    color: black;
}

.link:hover{
    color: #fc3b2d;
    transform: scale(1.5);
}

.navbar .container-fluid .navbar-brand img{
    height: 100%;
    max-height: 40px;
}
.navbar .container-fluid .navbar-nav a {
    font-size: calc( 0.9rem + 0.3vh);
}
.navbar .container-fluid .navbar-brand,
.navbar .container-fluid .navbar-nav a {
    text-decoration: none;
    margin: 0 1rem;
}

/* switch */
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.switch input { 
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: .4s;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
}

input:checked + .slider {
  background-color: #090040;
}

input:focus + .slider {
  box-shadow: 0 0 1px #090040;
}

input:checked + .slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}

/* Rounded sliders */
.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}
</style>