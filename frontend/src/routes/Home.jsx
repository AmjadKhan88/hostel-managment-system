<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Shaheen Hostel — modern hostel management and resident experience." />
  <title>Shaheen Hostel — Live Better. Stay Smarter.</title>

  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">

  <style>
    :root {
      --green:#10b981;
      --green-dark:#047857;
      --ink:#07130f;
      --muted:#60716b;
      --line:rgba(16,185,129,.14);
    }
    * { box-sizing:border-box; }
    html { scroll-behavior:smooth; }
    body {
      margin:0;
      background:#fbfefc;
      color:var(--ink);
      font-family:"DM Sans",sans-serif;
      overflow-x:hidden;
      -webkit-font-smoothing:antialiased;
    }
    .serif { font-family:"Instrument Serif",serif; }
    .noise:after {
      content:"";
      position:absolute; inset:0; pointer-events:none; opacity:.045;
      background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      mix-blend-mode:multiply;
    }
    .grid-bg {
      background-image:linear-gradient(rgba(16,185,129,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(16,185,129,.08) 1px,transparent 1px);
      background-size:48px 48px;
      mask-image:radial-gradient(ellipse 80% 65% at 50% 35%,#000 20%,transparent 85%);
    }
    .glass {
      background:rgba(255,255,255,.72);
      border:1px solid rgba(16,185,129,.14);
      box-shadow:0 20px 70px rgba(3,72,54,.09);
      backdrop-filter:blur(22px);
    }
    .hero-gradient {
      background:
        radial-gradient(circle at 12% 20%,rgba(52,211,153,.25),transparent 28%),
        radial-gradient(circle at 82% 12%,rgba(16,185,129,.16),transparent 25%),
        linear-gradient(180deg,#f4fff9 0%,#fff 72%);
    }
    .btn-primary {
      background:linear-gradient(135deg,#059669,#10b981);
      box-shadow:0 15px 35px -14px rgba(5,150,105,.75);
      transition:.35s cubic-bezier(.16,1,.3,1);
    }
    .btn-primary:hover { transform:translateY(-3px); box-shadow:0 22px 45px -14px rgba(5,150,105,.8); }
    .btn-ghost { transition:.3s; }
    .btn-ghost:hover { background:#ecfdf5; transform:translateY(-2px); }
    .reveal { opacity:0; transform:translateY(35px); transition:opacity .8s ease,transform .8s cubic-bezier(.16,1,.3,1); }
    .reveal.show { opacity:1; transform:none; }
    .delay-1{transition-delay:.08s}.delay-2{transition-delay:.16s}.delay-3{transition-delay:.24s}.delay-4{transition-delay:.32s}
    .float { animation:float 6s ease-in-out infinite; }
    .float2 { animation:float 5s ease-in-out -1.5s infinite; }
    @keyframes float { 0%,100%{transform:translateY(0)}50%{transform:translateY(-13px)} }
    @keyframes marquee { to{transform:translateX(-50%)} }
    .marquee { animation:marquee 28s linear infinite; width:max-content; }
    .shine { position:relative; overflow:hidden; }
    .shine:before {
      content:""; position:absolute; inset:-80% -20%; transform:translateX(-100%) rotate(18deg);
      background:linear-gradient(90deg,transparent,rgba(255,255,255,.42),transparent);
      animation:shine 4s infinite;
    }
    @keyframes shine { 0%,45%{transform:translateX(-100%) rotate(18deg)}65%,100%{transform:translateX(100%) rotate(18deg)} }
    .spotlight { position:relative; }
    .spotlight:before {
      content:""; position:absolute; width:500px;height:500px;border-radius:50%;
      background:radial-gradient(circle,rgba(16,185,129,.13),transparent 65%);
      left:var(--x,50%);top:var(--y,50%);transform:translate(-50%,-50%);
      pointer-events:none;opacity:0;transition:opacity .3s;
    }
    .spotlight:hover:before{opacity:1}
    .room-card { transition:.5s cubic-bezier(.16,1,.3,1); }
    .room-card:hover { transform:translateY(-8px) scale(1.01); }
    .room-card img { transition:transform .8s cubic-bezier(.16,1,.3,1); }
    .room-card:hover img { transform:scale(1.08); }
    .faq-answer { max-height:0; overflow:hidden; transition:max-height .4s ease; }
    .faq.open .faq-answer { max-height:220px; }
    .faq.open .faq-icon { transform:rotate(45deg); }
    .faq-icon { transition:.3s; }
    #roomCanvas { width:100%;height:100%;display:block; }
    .viewer-stage {
      background:
        radial-gradient(circle at 50% 35%,rgba(52,211,153,.22),transparent 28%),
        linear-gradient(135deg,#07130f,#0b241c 55%,#103a2b);
    }
    .scanline { animation:scan 3s linear infinite; }
    @keyframes scan { from{transform:translateY(-130%)}to{transform:translateY(420%)} }
    @media (prefers-reduced-motion:reduce) {
      *,*:before,*:after { animation-duration:.001ms!important;scroll-behavior:auto!important;transition-duration:.001ms!important; }
    }
  </style>
</head>

<body>
  <!-- NAV -->
  <header id="nav" class="fixed top-0 inset-x-0 z-50 transition-all duration-500">
    <nav class="max-w-7xl mx-auto px-5 md:px-6 py-4">
      <div id="navInner" class="glass rounded-2xl px-4 md:px-6 h-16 flex items-center justify-between">
        <a href="#home" class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-700 grid place-items-center shadow-lg shadow-emerald-500/25">
            <i class="fa-solid fa-feather-pointed text-white"></i>
          </div>
          <div class="leading-none">
            <div class="font-extrabold tracking-tight text-lg">Shaheen</div>
            <div class="text-[9px] uppercase tracking-[.28em] text-emerald-600 font-bold mt-1">Hostel</div>
          </div>
        </a>

        <div class="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <a href="#experience" class="hover:text-emerald-600 transition">Experience</a>
          <a href="#rooms" class="hover:text-emerald-600 transition">Rooms</a>
          <a href="#facilities" class="hover:text-emerald-600 transition">Facilities</a>
          <a href="#management" class="hover:text-emerald-600 transition">Management</a>
          <a href="#faq" class="hover:text-emerald-600 transition">FAQ</a>
        </div>

        <div class="flex items-center gap-2">
          <a href="#contact" class="hidden sm:inline-flex btn-ghost px-4 py-2.5 rounded-xl font-semibold text-sm">Contact</a>
          <a href="#rooms" class="btn-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm">Explore Rooms</a>
          <button id="menuBtn" class="lg:hidden w-10 h-10 rounded-xl border border-emerald-100 bg-white text-emerald-700">
            <i class="fa-solid fa-bars"></i>
          </button>
        </div>
      </div>

      <div id="mobileMenu" class="hidden lg:hidden glass rounded-2xl mt-2 p-3">
        <a href="#experience" class="block px-4 py-3 rounded-xl hover:bg-emerald-50">Experience</a>
        <a href="#rooms" class="block px-4 py-3 rounded-xl hover:bg-emerald-50">Rooms</a>
        <a href="#facilities" class="block px-4 py-3 rounded-xl hover:bg-emerald-50">Facilities</a>
        <a href="#management" class="block px-4 py-3 rounded-xl hover:bg-emerald-50">Management</a>
        <a href="#faq" class="block px-4 py-3 rounded-xl hover:bg-emerald-50">FAQ</a>
      </div>
    </nav>
  </header>

  <!-- HERO -->
  <main>
    <section id="home" class="hero-gradient noise relative min-h-screen pt-32 md:pt-40 pb-20 overflow-hidden">
      <div class="absolute inset-0 grid-bg"></div>
      <div class="absolute -top-40 -left-40 w-[520px] h-[520px] bg-emerald-300/25 rounded-full blur-[100px]"></div>
      <div class="absolute top-20 -right-48 w-[620px] h-[620px] bg-teal-200/25 rounded-full blur-[110px]"></div>

      <div class="relative max-w-7xl mx-auto px-5 md:px-6 grid lg:grid-cols-12 gap-12 items-center">
        <div class="lg:col-span-6">
          <div class="reveal inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-200 bg-white/75 text-emerald-700 text-xs font-bold uppercase tracking-wider">
            <span class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            A better place to live & study
          </div>

          <h1 class="reveal delay-1 serif text-6xl sm:text-7xl xl:text-[6.5rem] leading-[.88] tracking-tight mt-7">
            More than a <em class="text-emerald-600">room.</em><br>
            A place to <span class="italic text-slate-400">belong.</span>
          </h1>

          <p class="reveal delay-2 mt-7 text-lg md:text-xl text-slate-600 leading-relaxed max-w-xl">
            Comfortable rooms, reliable facilities, a secure environment and smart hostel management — designed around the everyday life of students.
          </p>

          <div class="reveal delay-3 flex flex-wrap gap-4 mt-9">
            <a href="#rooms" class="btn-primary text-white px-7 py-4 rounded-2xl font-bold inline-flex items-center gap-3">
              Find your room <i class="fa-solid fa-arrow-right text-xs"></i>
            </a>
            <button id="demoBtn" class="btn-ghost px-5 py-4 rounded-2xl font-bold inline-flex items-center gap-3">
              <span class="w-10 h-10 rounded-full bg-white border border-emerald-100 grid place-items-center shadow-sm">
                <i class="fa-solid fa-cube text-emerald-600 text-xs"></i>
              </span>
              Explore in 3D
            </button>
          </div>

          <div class="reveal delay-4 mt-12 flex flex-wrap gap-7 text-sm">
            <div>
              <div class="font-extrabold text-2xl"><span data-counter="120">0</span><span class="text-emerald-500">+</span></div>
              <div class="text-slate-500">Beds & rooms</div>
            </div>
            <div class="pl-7 border-l border-emerald-100">
              <div class="font-extrabold text-2xl"><span data-counter="350">0</span><span class="text-emerald-500">+</span></div>
              <div class="text-slate-500">Residents served</div>
            </div>
            <div class="pl-7 border-l border-emerald-100">
              <div class="font-extrabold text-2xl">24/7</div>
              <div class="text-slate-500">Security & support</div>
            </div>
          </div>
        </div>

        <!-- HERO VISUAL -->
        <div class="lg:col-span-6 relative min-h-[570px] flex items-center justify-center">
          <div class="absolute w-[470px] h-[470px] rounded-full border border-emerald-200/60"></div>
          <div class="absolute w-[360px] h-[360px] rounded-full border border-dashed border-emerald-300/50 animate-[spin_25s_linear_infinite]"></div>

          <div class="relative w-full max-w-[590px] h-[510px] rounded-[2rem] overflow-hidden shadow-2xl shadow-emerald-950/20">
            <img src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=90"
                 class="absolute inset-0 w-full h-full object-cover" alt="Modern hostel building">
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent"></div>

            <div class="absolute top-5 left-5 right-5 flex justify-between">
              <div class="glass rounded-full px-4 py-2 text-xs font-bold text-white border-white/20 bg-black/20">
                <i class="fa-solid fa-location-dot text-emerald-300 mr-1"></i> Shaheen Hostel
              </div>
              <div class="rounded-full bg-emerald-400 text-emerald-950 px-4 py-2 text-xs font-extrabold shadow-lg">Open for admissions</div>
            </div>

            <div class="absolute left-6 bottom-6 right-6 text-white">
              <div class="text-xs uppercase tracking-[.2em] text-emerald-300 font-bold">Live here</div>
              <div class="serif text-4xl mt-1">Comfort outside. Focus inside.</div>
              <div class="flex flex-wrap gap-2 mt-4">
                <span class="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs">Wi-Fi</span>
                <span class="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs">Power Backup</span>
                <span class="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs">CCTV</span>
              </div>
            </div>
          </div>

          <div class="absolute -left-1 md:left-0 bottom-10 glass rounded-2xl p-4 w-48 float">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-100 grid place-items-center"><i class="fa-solid fa-shield-halved text-emerald-700"></i></div>
              <div><div class="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Safety</div><div class="font-bold">24/7 monitored</div></div>
            </div>
          </div>

          <div class="absolute -right-1 md:right-0 top-10 glass rounded-2xl p-4 w-48 float2">
            <div class="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Resident experience</div>
            <div class="flex items-center gap-2 mt-2">
              <div class="text-2xl font-extrabold">4.9</div>
              <div class="text-amber-400 text-xs">★★★★★</div>
            </div>
            <div class="text-xs text-slate-500 mt-1">Based on resident feedback</div>
          </div>
        </div>
      </div>
    </section>

    <!-- TRUST MARQUEE -->
    <section class="border-y border-emerald-100 bg-white py-5 overflow-hidden">
      <div class="marquee flex gap-12 items-center text-sm font-bold text-slate-400 uppercase tracking-wider">
        <span><i class="fa-solid fa-wifi text-emerald-500 mr-2"></i> High-speed Wi-Fi</span>
        <span><i class="fa-solid fa-bolt text-emerald-500 mr-2"></i> Backup Power</span>
        <span><i class="fa-solid fa-video text-emerald-500 mr-2"></i> CCTV Security</span>
        <span><i class="fa-solid fa-utensils text-emerald-500 mr-2"></i> Mess & Meals</span>
        <span><i class="fa-solid fa-bed text-emerald-500 mr-2"></i> Furnished Rooms</span>
        <span><i class="fa-solid fa-headset text-emerald-500 mr-2"></i> Resident Support</span>
        <span><i class="fa-solid fa-wifi text-emerald-500 mr-2"></i> High-speed Wi-Fi</span>
        <span><i class="fa-solid fa-bolt text-emerald-500 mr-2"></i> Backup Power</span>
        <span><i class="fa-solid fa-video text-emerald-500 mr-2"></i> CCTV Security</span>
        <span><i class="fa-solid fa-utensils text-emerald-500 mr-2"></i> Mess & Meals</span>
        <span><i class="fa-solid fa-bed text-emerald-500 mr-2"></i> Furnished Rooms</span>
        <span><i class="fa-solid fa-headset text-emerald-500 mr-2"></i> Resident Support</span>
      </div>
    </section>

    <!-- EXPERIENCE -->
    <section id="experience" class="py-24 md:py-32">
      <div class="max-w-7xl mx-auto px-5 md:px-6">
        <div class="grid lg:grid-cols-12 gap-14 items-end">
          <div class="lg:col-span-7 reveal">
            <div class="text-emerald-600 text-xs font-extrabold uppercase tracking-[.22em] mb-5">The Shaheen experience</div>
            <h2 class="serif text-5xl md:text-7xl leading-[.95]">Built around the way<br><em class="text-slate-400">students actually live.</em></h2>
          </div>
          <p class="lg:col-span-5 reveal delay-2 text-lg text-slate-500 leading-relaxed">
            A hostel should remove distractions, not create them. Every part of the experience is designed to make studying, resting and living easier.
          </p>
        </div>

        <div id="facilities" class="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mt-16">
          <article class="spotlight reveal p-7 rounded-3xl border border-emerald-100 bg-white">
            <div class="w-12 h-12 rounded-2xl bg-emerald-50 grid place-items-center text-emerald-600 mb-8"><i class="fa-solid fa-wifi"></i></div>
            <h3 class="font-extrabold text-xl">Always connected</h3>
            <p class="text-slate-500 mt-3 leading-relaxed text-sm">Reliable high-speed internet for classes, coding, research and entertainment.</p>
          </article>
          <article class="spotlight reveal delay-1 p-7 rounded-3xl border border-emerald-100 bg-white">
            <div class="w-12 h-12 rounded-2xl bg-emerald-50 grid place-items-center text-emerald-600 mb-8"><i class="fa-solid fa-plug-circle-bolt"></i></div>
            <h3 class="font-extrabold text-xl">Power when you need it</h3>
            <p class="text-slate-500 mt-3 leading-relaxed text-sm">Backup power keeps your study schedule moving when the grid doesn't.</p>
          </article>
          <article class="spotlight reveal delay-2 p-7 rounded-3xl border border-emerald-100 bg-white">
            <div class="w-12 h-12 rounded-2xl bg-emerald-50 grid place-items-center text-emerald-600 mb-8"><i class="fa-solid fa-shield-halved"></i></div>
            <h3 class="font-extrabold text-xl">Security first</h3>
            <p class="text-slate-500 mt-3 leading-relaxed text-sm">Monitored entrances, CCTV and staff support help keep residents and belongings safe.</p>
          </article>
          <article class="spotlight reveal delay-3 p-7 rounded-3xl border border-emerald-100 bg-white">
            <div class="w-12 h-12 rounded-2xl bg-emerald-50 grid place-items-center text-emerald-600 mb-8"><i class="fa-solid fa-book-open"></i></div>
            <h3 class="font-extrabold text-xl">Study-friendly</h3>
            <p class="text-slate-500 mt-3 leading-relaxed text-sm">Quiet spaces, dedicated desks and a routine-friendly environment for focused work.</p>
          </article>
        </div>
      </div>
    </section>

    <!-- 3D ROOM VIEWER -->
    <section id="rooms" class="py-24 md:py-32 bg-[#07130f] text-white overflow-hidden">
      <div class="max-w-7xl mx-auto px-5 md:px-6">
        <div class="grid lg:grid-cols-12 gap-12 items-center">
          <div class="lg:col-span-5 reveal">
            <div class="text-emerald-300 text-xs font-extrabold uppercase tracking-[.22em] mb-5">Interactive room tour</div>
            <h2 class="serif text-5xl md:text-7xl leading-[.95]">Don't just look.<br><em class="text-emerald-300">Explore.</em></h2>
            <p class="text-white/60 text-lg leading-relaxed mt-6">
              Rotate the room, zoom in and inspect the layout. Replace the demo geometry with your actual 3D room model later.
            </p>

            <div class="grid grid-cols-2 gap-3 mt-9">
              <button class="room-mode active rounded-2xl border border-emerald-400/40 bg-emerald-500/15 px-4 py-4 text-left" data-mode="single">
                <div class="font-bold">Single Room</div><div class="text-xs text-white/45 mt-1">Private setup</div>
              </button>
              <button class="room-mode rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left" data-mode="shared">
                <div class="font-bold">Shared Room</div><div class="text-xs text-white/45 mt-1">Two-bed setup</div>
              </button>
            </div>

            <div class="flex flex-wrap gap-3 mt-6">
              <span class="px-3 py-2 rounded-full bg-white/5 border border-white/10 text-xs"><i class="fa-solid fa-bed text-emerald-300 mr-2"></i>Furnished</span>
              <span class="px-3 py-2 rounded-full bg-white/5 border border-white/10 text-xs"><i class="fa-solid fa-chair text-emerald-300 mr-2"></i>Study desk</span>
              <span class="px-3 py-2 rounded-full bg-white/5 border border-white/10 text-xs"><i class="fa-solid fa-fan text-emerald-300 mr-2"></i>Ventilation</span>
            </div>
          </div>

          <div class="lg:col-span-7 reveal delay-2">
            <div class="relative rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
              <div class="viewer-stage relative aspect-[4/3]">
                <canvas id="roomCanvas"></canvas>
                <div class="scanline absolute left-0 right-0 h-px bg-emerald-300/30 pointer-events-none"></div>
                <div class="absolute top-5 left-5 px-3 py-2 rounded-xl bg-black/30 backdrop-blur border border-white/10 text-xs text-white/70">
                  <i class="fa-solid fa-arrows-rotate mr-2 text-emerald-300"></i> Drag to rotate · Scroll to zoom
                </div>
                <div class="absolute bottom-5 left-5 right-5 flex justify-between items-end">
                  <div>
                    <div id="roomLabel" class="text-xl font-bold">Single Room</div>
                    <div id="roomPrice" class="text-sm text-white/55">Comfortable private setup</div>
                  </div>
                  <div class="rounded-xl bg-emerald-400 text-emerald-950 px-4 py-2 font-extrabold text-sm">View 3D</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ROOM CARDS -->
        <div class="grid md:grid-cols-3 gap-5 mt-12">
          <article class="room-card rounded-3xl overflow-hidden bg-white/5 border border-white/10">
            <div class="aspect-[4/3] overflow-hidden"><img src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=900&q=85" class="w-full h-full object-cover" alt="Single room"></div>
            <div class="p-6"><div class="text-emerald-300 text-xs font-bold uppercase tracking-wider">01 · Private</div><h3 class="text-xl font-bold mt-2">Single Room</h3><p class="text-white/50 text-sm mt-2">For residents who prefer privacy and maximum focus.</p></div>
          </article>
          <article class="room-card rounded-3xl overflow-hidden bg-white/5 border border-white/10">
            <div class="aspect-[4/3] overflow-hidden"><img src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=85" class="w-full h-full object-cover" alt="Shared room"></div>
            <div class="p-6"><div class="text-emerald-300 text-xs font-bold uppercase tracking-wider">02 · Shared</div><h3 class="text-xl font-bold mt-2">Twin Sharing</h3><p class="text-white/50 text-sm mt-2">A practical setup with space to study, sleep and store your things.</p></div>
          </article>
          <article class="room-card rounded-3xl overflow-hidden bg-white/5 border border-white/10">
            <div class="aspect-[4/3] overflow-hidden"><img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=85" class="w-full h-full object-cover" alt="Common study area"></div>
            <div class="p-6"><div class="text-emerald-300 text-xs font-bold uppercase tracking-wider">03 · Common</div><h3 class="text-xl font-bold mt-2">Study & Lounge</h3><p class="text-white/50 text-sm mt-2">Shared spaces for group work, reading and downtime.</p></div>
          </article>
        </div>
      </div>
    </section>

    <!-- MANAGEMENT -->
    <section id="management" class="py-24 md:py-32">
      <div class="max-w-7xl mx-auto px-5 md:px-6">
        <div class="text-center max-w-3xl mx-auto reveal">
          <div class="text-emerald-600 text-xs font-extrabold uppercase tracking-[.22em] mb-5">Smart management</div>
          <h2 class="serif text-5xl md:text-7xl leading-[.95]">The hostel experience,<br><em class="text-slate-400">managed intelligently.</em></h2>
          <p class="text-slate-500 text-lg mt-6">A modern resident portal and admin system keep rooms, fees, maintenance and communication in one place.</p>
        </div>

        <div class="relative mt-16 max-w-6xl mx-auto">
          <div class="absolute -inset-5 bg-gradient-to-r from-emerald-200 via-teal-100 to-emerald-200 blur-3xl opacity-40 rounded-[3rem]"></div>
          <div class="relative rounded-[2rem] overflow-hidden border border-emerald-100 shadow-2xl bg-white">
            <div class="h-12 border-b border-emerald-100 bg-emerald-50/60 flex items-center gap-2 px-5">
              <span class="w-3 h-3 rounded-full bg-red-300"></span><span class="w-3 h-3 rounded-full bg-yellow-300"></span><span class="w-3 h-3 rounded-full bg-emerald-400"></span>
              <div class="ml-4 flex-1 max-w-md bg-white rounded-lg border border-emerald-100 px-3 py-1.5 text-xs text-slate-400">app.shaheenhostel.com/dashboard</div>
            </div>
            <div class="p-5 md:p-8 grid md:grid-cols-12 gap-5">
              <aside class="hidden md:block md:col-span-2">
                <div class="font-extrabold mb-8">Shaheen</div>
                <div class="space-y-2 text-xs">
                  <div class="p-3 rounded-xl bg-emerald-500 text-white"><i class="fa-solid fa-chart-line mr-2"></i>Overview</div>
                  <div class="p-3 text-slate-400"><i class="fa-solid fa-bed mr-2"></i>Rooms</div>
                  <div class="p-3 text-slate-400"><i class="fa-solid fa-users mr-2"></i>Residents</div>
                  <div class="p-3 text-slate-400"><i class="fa-solid fa-receipt mr-2"></i>Payments</div>
                  <div class="p-3 text-slate-400"><i class="fa-solid fa-screwdriver-wrench mr-2"></i>Maintenance</div>
                </div>
              </aside>
              <div class="md:col-span-10">
                <div class="flex items-center justify-between">
                  <div><div class="text-xs text-slate-400">Tuesday, September 22</div><div class="text-2xl font-extrabold mt-1">Hostel Overview</div></div>
                  <div class="w-9 h-9 rounded-full bg-emerald-100 grid place-items-center text-emerald-700"><i class="fa-solid fa-bell text-xs"></i></div>
                </div>
                <div class="grid sm:grid-cols-3 gap-4 mt-7">
                  <div class="rounded-2xl bg-emerald-500 text-white p-5"><div class="text-[10px] uppercase tracking-wider opacity-70">Occupancy</div><div class="text-3xl font-extrabold mt-2">92%</div><div class="h-1.5 rounded-full bg-white/20 mt-4"><div class="w-[92%] h-full rounded-full bg-white"></div></div></div>
                  <div class="rounded-2xl bg-emerald-50 p-5"><div class="text-[10px] uppercase tracking-wider text-emerald-700">Collected</div><div class="text-3xl font-extrabold mt-2 text-slate-900">₨4.2M</div><div class="text-xs text-emerald-600 mt-4">↑ 12% this month</div></div>
                  <div class="rounded-2xl bg-slate-50 p-5"><div class="text-[10px] uppercase tracking-wider text-slate-500">Open tickets</div><div class="text-3xl font-extrabold mt-2 text-slate-900">07</div><div class="text-xs text-slate-400 mt-4">03 resolved today</div></div>
                </div>
                <div class="grid lg:grid-cols-5 gap-4 mt-4">
                  <div class="lg:col-span-3 rounded-2xl border border-slate-100 p-5 h-48">
                    <div class="flex justify-between text-sm font-bold"><span>Occupancy trend</span><span class="text-emerald-600">+8.4%</span></div>
                    <div class="h-28 mt-5 flex items-end gap-2">
                      <i class="w-full bg-emerald-100 rounded-t h-[35%]"></i><i class="w-full bg-emerald-200 rounded-t h-[45%]"></i><i class="w-full bg-emerald-200 rounded-t h-[50%]"></i><i class="w-full bg-emerald-300 rounded-t h-[60%]"></i><i class="w-full bg-emerald-300 rounded-t h-[72%]"></i><i class="w-full bg-emerald-400 rounded-t h-[82%]"></i><i class="w-full bg-emerald-500 rounded-t h-[92%]"></i>
                    </div>
                  </div>
                  <div class="lg:col-span-2 rounded-2xl border border-slate-100 p-5 h-48">
                    <div class="text-sm font-bold">Recent activity</div>
                    <div class="space-y-4 mt-5 text-xs">
                      <div class="flex gap-3"><span class="w-2 h-2 rounded-full bg-emerald-500 mt-1"></span><span>Room 204 assigned <b>2m</b></span></div>
                      <div class="flex gap-3"><span class="w-2 h-2 rounded-full bg-amber-400 mt-1"></span><span>Maintenance ticket <b>12m</b></span></div>
                      <div class="flex gap-3"><span class="w-2 h-2 rounded-full bg-blue-400 mt-1"></span><span>Fee receipt generated <b>31m</b></span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="grid md:grid-cols-3 gap-5 mt-8">
          <div class="reveal p-7 rounded-3xl bg-emerald-50 border border-emerald-100"><i class="fa-solid fa-mobile-screen text-emerald-600"></i><h3 class="font-extrabold mt-5">Resident portal</h3><p class="text-sm text-slate-500 mt-2 leading-relaxed">Requests, notices, payments and room information from any device.</p></div>
          <div class="reveal delay-1 p-7 rounded-3xl bg-white border border-emerald-100"><i class="fa-solid fa-chart-pie text-emerald-600"></i><h3 class="font-extrabold mt-5">Useful analytics</h3><p class="text-sm text-slate-500 mt-2 leading-relaxed">Understand occupancy, revenue, maintenance and resident activity at a glance.</p></div>
          <div class="reveal delay-2 p-7 rounded-3xl bg-white border border-emerald-100"><i class="fa-solid fa-bell text-emerald-600"></i><h3 class="font-extrabold mt-5">Instant updates</h3><p class="text-sm text-slate-500 mt-2 leading-relaxed">Keep residents and staff aligned with timely notifications and status changes.</p></div>
        </div>
      </div>
    </section>

    <!-- SOCIAL PROOF -->
    <section class="py-24 bg-emerald-50/60">
      <div class="max-w-7xl mx-auto px-5 md:px-6">
        <div class="grid lg:grid-cols-12 gap-12 items-center">
          <div class="lg:col-span-5 reveal">
            <div class="text-emerald-600 text-xs font-extrabold uppercase tracking-[.22em] mb-5">Resident voices</div>
            <h2 class="serif text-5xl md:text-6xl leading-[.95]">A hostel is judged by the <em class="text-emerald-600">little things.</em></h2>
          </div>
          <div class="lg:col-span-7 grid md:grid-cols-2 gap-5">
            <blockquote class="reveal bg-white rounded-3xl p-7 border border-emerald-100">
              <div class="text-amber-400 text-sm">★★★★★</div>
              <p class="text-slate-700 leading-relaxed mt-5">“The biggest difference is that I can focus on university without constantly worrying about basic hostel problems.”</p>
              <footer class="mt-7 text-sm font-bold">Resident feedback <span class="text-slate-400 font-normal">· Student</span></footer>
            </blockquote>
            <blockquote class="reveal delay-1 bg-[#07130f] text-white rounded-3xl p-7">
              <div class="text-amber-300 text-sm">★★★★★</div>
              <p class="text-white/70 leading-relaxed mt-5">“Room allocation, payments and maintenance are much easier to track when everything is in one system.”</p>
              <footer class="mt-7 text-sm font-bold">Management feedback <span class="text-white/40 font-normal">· Admin</span></footer>
            </blockquote>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section id="faq" class="py-24 md:py-32">
      <div class="max-w-4xl mx-auto px-5 md:px-6">
        <div class="text-center reveal">
          <div class="text-emerald-600 text-xs font-extrabold uppercase tracking-[.22em] mb-5">Questions</div>
          <h2 class="serif text-5xl md:text-6xl">Before you move in.</h2>
        </div>

        <div class="mt-12 space-y-3">
          <div class="faq reveal rounded-2xl border border-emerald-100 bg-white">
            <button class="faq-btn w-full p-6 flex justify-between text-left font-bold"><span>What room types are available?</span><i class="faq-icon fa-solid fa-plus text-emerald-600"></i></button>
            <div class="faq-answer px-6"><p class="pb-6 text-slate-500 leading-relaxed">Shaheen can offer single and shared rooms depending on availability. Replace this copy with your exact room categories, prices and occupancy rules.</p></div>
          </div>
          <div class="faq reveal delay-1 rounded-2xl border border-emerald-100 bg-white">
            <button class="faq-btn w-full p-6 flex justify-between text-left font-bold"><span>Is internet and backup power available?</span><i class="faq-icon fa-solid fa-plus text-emerald-600"></i></button>
            <div class="faq-answer px-6"><p class="pb-6 text-slate-500 leading-relaxed">Yes — the landing page is structured to highlight Wi-Fi and power backup. Update the exact speed, backup duration and availability from your actual hostel details.</p></div>
          </div>
          <div class="faq reveal delay-2 rounded-2xl border border-emerald-100 bg-white">
            <button class="faq-btn w-full p-6 flex justify-between text-left font-bold"><span>How can I check room availability?</span><i class="faq-icon fa-solid fa-plus text-emerald-600"></i></button>
            <div class="faq-answer px-6"><p class="pb-6 text-slate-500 leading-relaxed">Use the Explore Rooms or Contact buttons. If your backend exposes availability, connect those buttons to your live room API and show real-time availability.</p></div>
          </div>
          <div class="faq reveal delay-3 rounded-2xl border border-emerald-100 bg-white">
            <button class="faq-btn w-full p-6 flex justify-between text-left font-bold"><span>Can residents manage payments and maintenance online?</span><i class="faq-icon fa-solid fa-plus text-emerald-600"></i></button>
            <div class="faq-answer px-6"><p class="pb-6 text-slate-500 leading-relaxed">The UI includes a resident-management concept for payments, requests and notifications. Connect these actions to your actual hostel management API.</p></div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section id="contact" class="pb-20">
      <div class="max-w-7xl mx-auto px-5 md:px-6">
        <div class="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-600 to-emerald-900 px-7 py-16 md:px-16 md:py-24 text-center text-white noise">
          <div class="absolute -top-32 -right-20 w-96 h-96 rounded-full bg-emerald-300/20 blur-3xl"></div>
          <div class="absolute -bottom-40 -left-20 w-96 h-96 rounded-full bg-teal-300/15 blur-3xl"></div>
          <div class="relative">
            <div class="text-emerald-200 text-xs font-extrabold uppercase tracking-[.25em]">Ready when you are</div>
            <h2 class="serif text-5xl md:text-7xl leading-[.9] mt-5">Come see what<br><em>Shaheen feels like.</em></h2>
            <p class="text-emerald-50/75 max-w-xl mx-auto mt-6 text-lg">Book a visit, ask about availability or talk to our team about the right room for you.</p>
            <div class="flex flex-wrap justify-center gap-4 mt-9">
              <a href="tel:+923001234567" class="bg-white text-emerald-800 px-7 py-4 rounded-2xl font-extrabold inline-flex items-center gap-2"><i class="fa-solid fa-phone"></i> Call us</a>
              <a href="https://wa.me/923001234567" class="border border-white/25 bg-white/10 backdrop-blur px-7 py-4 rounded-2xl font-extrabold inline-flex items-center gap-2"><i class="fa-brands fa-whatsapp"></i> WhatsApp</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>

  <!-- FOOTER -->
  <footer class="border-t border-emerald-100 bg-white">
    <div class="max-w-7xl mx-auto px-5 md:px-6 py-12">
      <div class="grid md:grid-cols-12 gap-10">
        <div class="md:col-span-5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-700 grid place-items-center"><i class="fa-solid fa-feather-pointed text-white"></i></div>
            <div class="font-extrabold text-lg">Shaheen Hostel</div>
          </div>
          <p class="text-slate-500 text-sm leading-relaxed max-w-sm mt-5">A modern hostel experience built for comfortable living, focused study and simple management.</p>
        </div>
        <div class="md:col-span-2">
          <div class="text-xs font-extrabold uppercase tracking-wider text-slate-400">Explore</div>
          <div class="space-y-3 mt-4 text-sm text-slate-600">
            <a href="#rooms" class="block hover:text-emerald-600">Rooms</a>
            <a href="#facilities" class="block hover:text-emerald-600">Facilities</a>
            <a href="#management" class="block hover:text-emerald-600">Management</a>
          </div>
        </div>
        <div class="md:col-span-2">
          <div class="text-xs font-extrabold uppercase tracking-wider text-slate-400">Support</div>
          <div class="space-y-3 mt-4 text-sm text-slate-600">
            <a href="#faq" class="block hover:text-emerald-600">FAQ</a>
            <a href="#contact" class="block hover:text-emerald-600">Contact</a>
            <a href="#" class="block hover:text-emerald-600">Privacy</a>
          </div>
        </div>
        <div class="md:col-span-3">
          <div class="text-xs font-extrabold uppercase tracking-wider text-slate-400">Visit</div>
          <p class="text-sm text-slate-600 leading-relaxed mt-4">Replace with your actual hostel address<br>Peshawar, Khyber Pakhtunkhwa<br>Pakistan</p>
          <div class="flex gap-2 mt-4">
            <a href="#" class="w-9 h-9 rounded-xl bg-emerald-50 grid place-items-center text-emerald-700 hover:bg-emerald-500 hover:text-white transition"><i class="fa-brands fa-facebook-f"></i></a>
            <a href="#" class="w-9 h-9 rounded-xl bg-emerald-50 grid place-items-center text-emerald-700 hover:bg-emerald-500 hover:text-white transition"><i class="fa-brands fa-instagram"></i></a>
            <a href="https://wa.me/923001234567" class="w-9 h-9 rounded-xl bg-emerald-50 grid place-items-center text-emerald-700 hover:bg-emerald-500 hover:text-white transition"><i class="fa-brands fa-whatsapp"></i></a>
          </div>
        </div>
      </div>
      <div class="border-t border-emerald-100 mt-10 pt-6 flex flex-col md:flex-row justify-between gap-3 text-xs text-slate-400">
        <span>© 2026 Shaheen Hostel. All rights reserved.</span>
        <span>Designed for a modern resident experience.</span>
      </div>
    </div>
  </footer>

  <!-- 3D / UI scripts -->
  <script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.160.0/examples/js/controls/OrbitControls.js"></script>

  <script>
    // Mobile menu
    const menuBtn = document.getElementById('menuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    menuBtn?.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
      menuBtn.innerHTML = mobileMenu.classList.contains('hidden')
        ? '<i class="fa-solid fa-bars"></i>' : '<i class="fa-solid fa-xmark"></i>';
    });
    document.querySelectorAll('#mobileMenu a').forEach(a => a.addEventListener('click', () => mobileMenu.classList.add('hidden')));

    // Nav glass state
    const navInner = document.getElementById('navInner');
    window.addEventListener('scroll', () => {
      navInner.style.boxShadow = window.scrollY > 20 ? '0 18px 55px rgba(3,72,54,.12)' : '0 20px 70px rgba(3,72,54,.09)';
    });

    // Scroll reveal
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('show'); });
    }, {threshold:.12});
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // Spotlight mouse position
    document.querySelectorAll('.spotlight').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--x', (e.clientX-r.left)+'px');
        card.style.setProperty('--y', (e.clientY-r.top)+'px');
      });
    });

    // Counters
    const counters = document.querySelectorAll('[data-counter]');
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting || entry.target.dataset.done) return;
        entry.target.dataset.done = '1';
        const target = +entry.target.dataset.counter;
        let start = 0;
        const duration = 1200;
        const t0 = performance.now();
        function tick(now) {
          const p = Math.min((now-t0)/duration,1);
          const eased = 1-Math.pow(1-p,3);
          entry.target.textContent = Math.floor(target*eased);
          if(p<1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, {threshold:.8});
    counters.forEach(c => counterObserver.observe(c));

    // FAQ
    document.querySelectorAll('.faq-btn').forEach(btn => {
      btn.addEventListener('click', () => btn.parentElement.classList.toggle('open'));
    });

    // 3D room viewer
    const canvas = document.getElementById('roomCanvas');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07130f);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(7, 5.5, 8);

    const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = .06;
    controls.minDistance = 5;
    controls.maxDistance = 13;
    controls.maxPolarAngle = Math.PI/2.02;
    controls.target.set(0,1.3,0);

    scene.add(new THREE.AmbientLight(0xb9ffe5, 1.8));
    const key = new THREE.DirectionalLight(0xffffff, 3);
    key.position.set(4,8,5); key.castShadow = true; scene.add(key);
    const fill = new THREE.PointLight(0x34d399, 18, 16);
    fill.position.set(-3,3,1); scene.add(fill);

    const room = new THREE.Group();
    scene.add(room);

    const mats = {
      floor:new THREE.MeshStandardMaterial({color:0x26352f,roughness:.78}),
      wall:new THREE.MeshStandardMaterial({color:0xeaf8f2,roughness:.9}),
      wood:new THREE.MeshStandardMaterial({color:0x8b5e3c,roughness:.6}),
      white:new THREE.MeshStandardMaterial({color:0xf8faf9,roughness:.85}),
      green:new THREE.MeshStandardMaterial({color:0x10b981,roughness:.5}),
      dark:new THREE.MeshStandardMaterial({color:0x17231f,roughness:.6}),
      glass:new THREE.MeshPhysicalMaterial({color:0x9fffdc,transparent:true,opacity:.28,roughness:.1,metalness:.1})
    };

    function box(name, size, pos, mat, cast=true) {
      const g = new THREE.BoxGeometry(...size);
      const m = new THREE.Mesh(g, mat);
      m.name=name; m.position.set(...pos); m.castShadow=cast; m.receiveShadow=true; room.add(m); return m;
    }

    function buildRoom(mode='single') {
      while(room.children.length) room.remove(room.children[0]);

      box('floor',[10,.18,8],[0,0,0],mats.floor,false);
      box('back',[10,3.8,.18],[0,1.9,-4],mats.wall,false);
      box('left',[.18,3.8,8],[-5,1.9,0],mats.wall,false);
      box('right',[.18,3.8,8],[5,1.9,0],mats.wall,false);
      box('ceiling',[10,.12,8],[0,3.85,0],mats.white,false);

      const beds = mode==='single' ? [-2.6] : [-2.8,2.1];
      beds.forEach((x,i)=>{
        box('bed'+i,[2.4,.38,4.2],[x,.45,-.6],mats.white);
        box('head'+i,[2.4,1.35,.18],[x,1.1,-2.55],mats.wood);
        box('pillow'+i,[1.65,.18,.65],[x, .72,-2.05],mats.white);
        box('blanket'+i,[2.1,.08,2.0],[x,.69,.1],i?mats.green:mats.dark,false);
      });

      const deskX = mode==='single' ? 2.6 : 2.8;
      box('desk',[2.3,.15,.85],[deskX,.9,-1.7],mats.wood);
      box('deskLeg',[.12,.9,.12],[deskX-.95,.42,-1.7],mats.dark);
      box('deskLeg',[.12,.9,.12],[deskX+.95,.42,-1.7],mats.dark);
      box('chair',[.8,.12,.8],[deskX, .55,-.35],mats.dark);
      box('monitor',[1.0,.7,.06],[deskX,1.35,-1.65],mats.dark);

      // wardrobe
      box('wardrobe',[1.3,2.5,.7],[-3.8,1.25,2.5],mats.wood);
      // window
      box('window',[2.3,1.7,.06],[1.0,2.35,-3.88],mats.glass,false);
      box('frame',[.08,1.9,.1],[-.15,2.35,-3.8],mats.white,false);
      box('frame',[.08,1.9,.1],[2.15,2.35,-3.8],mats.white,false);
      box('frame',[2.3,.08,.1],[1,3.25,-3.8],mats.white,false);
      box('frame',[2.3,.08,.1],[1,1.45,-3.8],mats.white,false);

      const rug = new THREE.Mesh(new THREE.BoxGeometry(3.2,.03,2.2), new THREE.MeshStandardMaterial({color:0x315b4b,roughness:1}));
      rug.position.set(0,.11,2); rug.receiveShadow=true; room.add(rug);
    }
    buildRoom();

    function resize3D(){
      const r=canvas.getBoundingClientRect();
      renderer.setSize(r.width,r.height,false);
      camera.aspect=r.width/r.height;
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize',resize3D); resize3D();

    function animate(){
      requestAnimationFrame(animate);
      controls.update();
      room.rotation.y += .0007;
      renderer.render(scene,camera);
    }
    animate();

    document.querySelectorAll('.room-mode').forEach(btn=>{
      btn.addEventListener('click',()=>{
        document.querySelectorAll('.room-mode').forEach(b=>b.classList.remove('active','bg-emerald-500/15','border-emerald-400/40'));
        btn.classList.add('active','bg-emerald-500/15','border-emerald-400/40');
        const mode=btn.dataset.mode;
        buildRoom(mode);
        document.getElementById('roomLabel').textContent = mode==='single' ? 'Single Room' : 'Shared Room';
        document.getElementById('roomPrice').textContent = mode==='single' ? 'Comfortable private setup' : 'Two-bed shared setup';
      });
    });

    document.getElementById('demoBtn')?.addEventListener('click',()=>{
      document.getElementById('rooms').scrollIntoView({behavior:'smooth'});
    });
  </script>
</body>
</html>