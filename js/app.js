<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PremiumotionCraft — Showcase Studio</title>
  <style>
    :root{
      --bg:#090c11;
      --panel:#101722;
      --panel2:#151f2c;
      --panel3:#0d131b;
      --text:#eef3f9;
      --muted:#93a4ba;
      --accent:#d2aa62;
      --accent2:#39b8a7;
      --accent3:#7c8cff;
      --danger:#f06a6a;
      --line:rgba(255,255,255,.09);
      --shadow:0 24px 70px rgba(0,0,0,.42);
      --r:24px;
      --r2:18px;
      --sidebar:280px;
    }
    *{box-sizing:border-box}
    html,body{height:100%}
    body{
      margin:0;
      font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;
      background:
        radial-gradient(circle at 15% 0%, rgba(210,170,98,.16), transparent 28%),
        radial-gradient(circle at 100% 10%, rgba(57,184,167,.16), transparent 30%),
        radial-gradient(circle at 80% 100%, rgba(124,140,255,.12), transparent 28%),
        linear-gradient(180deg, #070a0f, #091019 42%, #06080c 100%);
      color:var(--text);
      overflow-x:hidden;
    }
    a{color:inherit;text-decoration:none}
    .app{
      display:grid;
      grid-template-columns:var(--sidebar) minmax(0,1fr);
      min-height:100vh;
    }
    .sidebar{
      position:sticky;top:0;height:100vh;overflow:auto;
      background:linear-gradient(180deg, rgba(12,18,26,.98), rgba(9,13,19,.98));
      border-left:1px solid var(--line);
      padding:22px 18px;
      box-shadow:var(--shadow);
      z-index:20;
    }
    .brand{
      display:flex;gap:14px;align-items:center;margin-bottom:18px;
    }
    .mark{
      width:52px;height:52px;border-radius:18px;
      background:linear-gradient(135deg, rgba(210,170,98,.95), rgba(57,184,167,.95));
      box-shadow:0 14px 40px rgba(57,184,167,.18);
      display:grid;place-items:center;font-weight:900;color:#091019;
    }
    .brand h1{margin:0;font-size:18px;line-height:1.2}
    .brand .sub{color:var(--muted);font-size:12px;margin-top:4px;line-height:1.6}
    .side-card{
      background:linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.015));
      border:1px solid var(--line);
      border-radius:20px;padding:14px;margin-bottom:14px;
    }
    .side-card .k{color:var(--muted);font-size:12px}
    .side-card .v{font-size:20px;font-weight:800;margin-top:6px}
    .nav{display:flex;flex-direction:column;gap:8px;margin-top:12px}
    .nav a{
      padding:12px 14px;border-radius:16px;border:1px solid transparent;
      color:#d7dfeb;background:transparent;transition:.18s ease;
      display:flex;align-items:center;justify-content:space-between;gap:10px;
    }
    .nav a:hover,.nav a.active{background:rgba(255,255,255,.05);border-color:var(--line);transform:translateX(-2px)}
    .nav small{color:var(--muted)}
    .sidebar .tools{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}
    .btn{
      border:1px solid var(--line);background:linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.02));
      color:var(--text);border-radius:999px;padding:11px 16px;cursor:pointer;transition:.16s ease;
      display:inline-flex;align-items:center;gap:8px;font:inherit;
    }
    .btn:hover{transform:translateY(-1px);border-color:rgba(210,170,98,.38)}
    .btn.primary{background:linear-gradient(180deg, rgba(210,170,98,.24), rgba(210,170,98,.09));border-color:rgba(210,170,98,.38)}
    .btn.alt{background:linear-gradient(180deg, rgba(57,184,167,.18), rgba(57,184,167,.06));border-color:rgba(57,184,167,.28)}
    .btn.soft{background:linear-gradient(180deg, rgba(124,140,255,.16), rgba(124,140,255,.06));border-color:rgba(124,140,255,.28)}
    .btn.danger{background:linear-gradient(180deg, rgba(240,106,106,.18), rgba(240,106,106,.06));border-color:rgba(240,106,106,.28)}
    .main{min-width:0}
    .hero{
      margin:18px 18px 0 18px;
      background:linear-gradient(135deg, rgba(16,23,34,.95), rgba(10,15,22,.9));
      border:1px solid var(--line);
      border-radius:32px;
      box-shadow:var(--shadow);
      padding:24px;
      overflow:hidden;
      position:relative;
    }
    .hero::before{
      content:"";position:absolute;inset:-2px;
      background:linear-gradient(90deg, transparent, rgba(255,255,255,.08), transparent);
      transform:translateX(-60%);animation:shine 7s linear infinite;pointer-events:none;opacity:.75;
    }
    @keyframes shine{to{transform:translateX(60%)}}
    .hero-top{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;flex-wrap:wrap;position:relative;z-index:1}
    .hero h2{margin:0;font-size:clamp(30px,4.2vw,58px);line-height:1.04;letter-spacing:-.03em}
    .hero p{margin:12px 0 0;color:var(--muted);max-width:1040px;line-height:1.85}
    .hero-actions{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
    .hero-grid{
      position:relative;z-index:1;margin-top:18px;
      display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;
    }
    .metric{
      padding:16px;border-radius:20px;border:1px solid var(--line);
      background:linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.015));
      min-height:100px;display:flex;flex-direction:column;justify-content:space-between;
    }
    .metric .k{color:var(--muted);font-size:12px}
    .metric .v{font-size:22px;font-weight:850}
    .metric .d{font-size:12px;color:#cfd8e5;line-height:1.6}
    .section{padding:18px}
    .stack{display:grid;gap:18px;margin:18px}
    .panel{
      background:linear-gradient(180deg, rgba(16,23,34,.95), rgba(11,16,23,.95));
      border:1px solid var(--line);
      border-radius:28px;
      box-shadow:var(--shadow);
      overflow:hidden;
    }
    .panel-head{
      padding:18px 18px 12px;
      display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap;
      border-bottom:1px solid var(--line);
    }
    .panel h3{margin:0;font-size:18px}
    .panel .sub{margin-top:6px;color:var(--muted);font-size:13px;line-height:1.7}
    .badge{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;background:rgba(255,255,255,.05);border:1px solid var(--line);font-size:12px;color:#d7dfeb}
    .panel-body{padding:18px}
    .grid-2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
    .grid-3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
    .grid-4{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}
    .grid-5{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px}
    .grid-6{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:12px}
    .stage{
      position:relative;min-height:320px;overflow:hidden;border-radius:22px;border:1px dashed rgba(255,255,255,.12);
      background:
        radial-gradient(circle at 18% 18%, rgba(210,170,98,.16), transparent 22%),
        radial-gradient(circle at 78% 24%, rgba(57,184,167,.12), transparent 24%),
        radial-gradient(circle at 60% 80%, rgba(124,140,255,.12), transparent 25%),
        linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.01));
    }
    .stage.tall{min-height:620px}
    .stage .hint{position:absolute;bottom:14px;left:14px;color:var(--muted);font-size:12px;line-height:1.5}
    .stage .corner{position:absolute;top:12px;right:12px;color:var(--muted);font-size:12px}
    .box{
      position:absolute;left:0;top:0;width:92px;height:92px;border-radius:24px;display:grid;place-items:center;
      color:#fff;font-weight:900;letter-spacing:.5px;user-select:none;cursor:grab;touch-action:none;
      box-shadow:0 18px 42px rgba(0,0,0,.3);background:linear-gradient(135deg, rgba(210,170,98,.95), rgba(57,184,167,.95));
    }
    .box.small{width:68px;height:68px;border-radius:18px;font-size:12px}
    .box.round{border-radius:999px}
    .box.outline{background:transparent;border:1px solid rgba(255,255,255,.2)}
    .bars{display:flex;gap:10px;align-items:end;height:200px;margin-top:18px}
    .bar{
      width:100%;border-radius:18px 18px 8px 8px;background:linear-gradient(180deg, rgba(57,184,167,.95), rgba(57,184,167,.2));
      min-height:28px;position:relative;transform-origin:bottom center;
    }
    .bar:nth-child(2){background:linear-gradient(180deg, rgba(210,170,98,.95), rgba(210,170,98,.2))}
    .bar:nth-child(3){background:linear-gradient(180deg, rgba(124,140,255,.95), rgba(124,140,255,.2))}
    .bar:nth-child(4){background:linear-gradient(180deg, rgba(240,106,106,.95), rgba(240,106,106,.2))}
    .bar span{position:absolute;bottom:100%;left:50%;transform:translateX(-50%);margin-bottom:8px;color:var(--muted);font-size:12px;white-space:nowrap}
    .controls{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
    .field{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
    .field label{min-width:110px;color:var(--muted);font-size:13px}
    .field input[type="range"]{width:min(280px,100%)}
    .field input[type="text"], .field select{
      background:#0c1219;border:1px solid var(--line);color:var(--text);border-radius:14px;padding:10px 12px;min-width:230px;
    }
    .codebox{
      background:#071019;border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:14px;color:#d9e6f1;
      font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;line-height:1.75;white-space:pre-wrap;min-height:150px;
    }
    .pill-list{display:flex;flex-wrap:wrap;gap:10px}
    .pill{padding:9px 12px;border-radius:999px;border:1px solid var(--line);background:rgba(255,255,255,.03);cursor:pointer;color:var(--text)}
    .pill.active{background:rgba(210,170,98,.16);border-color:rgba(210,170,98,.32)}
    .gallery{display:flex;gap:14px;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:4px;scrollbar-width:none}
    .gallery::-webkit-scrollbar{display:none}
    .gallery .item{flex:0 0 auto;scroll-snap-align:center;width:clamp(240px,36vw,380px);height:220px;position:relative;border-radius:22px;overflow:hidden;border:1px solid var(--line);background:#0c1118}
    .gallery .item img{width:100%;height:100%;object-fit:cover;display:block;transform:scale(1);transition:transform .5s ease}
    .gallery .item:hover img{transform:scale(1.05)}
    .gallery .cap{position:absolute;inset:auto 14px 14px 14px;padding:10px 12px;border-radius:14px;background:rgba(5,8,12,.58);backdrop-filter:blur(10px);font-size:13px}
    .log{
      background:#071019;border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:14px;min-height:220px;max-height:320px;overflow:auto;
      color:#cbd6e4;font-size:13px;line-height:1.75;
    }
    .text-demo{font-size:clamp(24px,4vw,64px);line-height:1.05;font-weight:900;letter-spacing:-.04em}
    .text-demo .accent{color:var(--accent)}
    .text-demo .accent2{color:var(--accent2)}
    .mini-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
    .mini{padding:14px;border-radius:18px;background:rgba(255,255,255,.03);border:1px solid var(--line);min-height:110px;display:flex;flex-direction:column;gap:8px;justify-content:space-between}
    .mini strong{font-size:15px}
    .mini span{color:var(--muted);font-size:12px;line-height:1.7}
    .drawer{
      position:fixed;left:18px;bottom:18px;width:min(560px,calc(100vw - 36px));z-index:50;display:none;
    }
    .drawer.open{display:block}
    .drawer .inner{background:linear-gradient(180deg, rgba(16,23,34,.98), rgba(10,14,20,.98));border:1px solid var(--line);border-radius:24px;box-shadow:var(--shadow);padding:16px}
    .drawer .top{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;margin-bottom:12px}
    .drawer .top h4{margin:0;font-size:18px}
    .drawer .top .s{color:var(--muted);font-size:12px;line-height:1.6;margin-top:5px}
    .cursor-ring{
      position:fixed;left:0;top:0;width:42px;height:42px;border-radius:50%;border:1px solid rgba(255,255,255,.24);
      pointer-events:none;transform:translate(-50%,-50%);mix-blend-mode:screen;z-index:9998;opacity:0;
      background:radial-gradient(circle, rgba(210,170,98,.16), transparent 72%);
    }
    .cursor-ring.show{opacity:1}
    .tag-row{display:flex;flex-wrap:wrap;gap:10px}
    .tag{padding:8px 11px;border-radius:999px;border:1px solid var(--line);background:rgba(255,255,255,.03);color:#d7dfeb;font-size:12px}
    .footer{padding:0 18px 18px;color:var(--muted);font-size:12px;line-height:1.8}
    .spacer{height:18px}
    .section-anchor{scroll-margin-top:18px}
    @media (max-width:1280px){
      .app{grid-template-columns:1fr}
      .sidebar{position:relative;height:auto;border-left:none;border-bottom:1px solid var(--line)}
      .grid-2,.grid-3,.grid-4,.grid-5,.grid-6,.mini-grid,.hero-grid{grid-template-columns:1fr 1fr}
    }
    @media (max-width:860px){
      .hero,.stack{margin:12px}
      .grid-2,.grid-3,.grid-4,.grid-5,.grid-6,.mini-grid,.hero-grid{grid-template-columns:1fr}
      .sidebar{padding:16px 14px}
      .hero h2{font-size:clamp(28px,8vw,44px)}
    }
  </style>
</head>
<body>
  <div class="cursor-ring" id="cursorRing"></div>
  <div class="app">
    <aside class="sidebar">
      <div class="brand">
        <div class="mark">PC</div>
        <div>
          <h1>PremiumotionCraft<br>Showcase Studio</h1>
          <div class="sub">واجهة استعراض شاملة على نمط صفحات GSAP demo.</div>
        </div>
      </div>

      <div class="side-card">
        <div class="k">Status</div>
        <div class="v" id="statusTitle">Loading...</div>
        <div class="sub" id="statusSub">Checking library features</div>
      </div>

      <div class="side-card">
        <div class="k">Feature buckets</div>
        <div class="tag-row">
          <span class="tag">Motion</span><span class="tag">Timeline</span><span class="tag">Scroll</span>
          <span class="tag">FLIP</span><span class="tag">Morph</span><span class="tag">Text</span>
          <span class="tag">UI</span><span class="tag">Drag</span><span class="tag">Magnetic</span>
          <span class="tag">Cursor</span><span class="tag">Parallax</span><span class="tag">Charts</span>
        </div>
      </div>

      <nav class="nav" id="nav">
        <a href="#hero" class="active"><span>Overview</span><small>01</small></a>
        <a href="#motion"><span>Motion Studio</span><small>02</small></a>
        <a href="#timeline"><span>Timeline Lab</span><small>03</small></a>
        <a href="#scroll"><span>Scroll Theater</span><small>04</small></a>
        <a href="#flip"><span>FLIP / Morph</span><small>05</small></a>
        <a href="#text"><span>Text Lab</span><small>06</small></a>
        <a href="#interaction"><span>Interaction Lab</span><small>07</small></a>
        <a href="#ui"><span>UI & Overlays</span><small>08</small></a>
        <a href="#gallery"><span>Showcase Gallery</span><small>09</small></a>
        <a href="#diagnostics"><span>Diagnostics</span><small>10</small></a>
      </nav>

      <div class="tools">
        <button class="btn primary" id="runAllBtn">Run All</button>
        <button class="btn alt" id="openDrawerBtn">Inspector</button>
        <button class="btn soft" id="resetBtn">Reset</button>
        <button class="btn danger" id="killBtn">Kill All</button>
      </div>
    </aside>

    <main class="main">
      <section class="hero section-anchor" id="hero">
        <div class="hero-top">
          <div>
            <h2>واجهة عرض كاملة لمكتبتك.</h2>
            <p>
              هذه الصفحة مصممة لتبدو مثل صفحات استعراض GSAP: تجربة حيّة، أقسام مستقلة، أزرار تشغيل سريعة، ومختبرات
              واضحة لكل فئة. الفكرة هنا ليست “عرض عناصر فقط”، بل تقديم رحلة كاملة تكشف قدرات الحركة والتمرير والسحب
              والتحويلات والـ UI والنص والـ showcase والـ diagnostics في مكان واحد.
            </p>
          </div>
          <div class="hero-actions">
            <button class="btn primary" id="heroRun">Start Showcase</button>
            <button class="btn alt" id="heroModal">Open Overlay</button>
            <button class="btn">Copy API Map</button>
          </div>
        </div>
        <div class="hero-grid">
          <div class="metric"><div class="k">Core motion</div><div class="v">Tween / Timeline</div><div class="d">حركة أساسية وتسلسل.</div></div>
          <div class="metric"><div class="k">Advanced layout</div><div class="v">FLIP / Morph</div><div class="d">إعادة ترتيب وانسياب بصري.</div></div>
          <div class="metric"><div class="k">Interaction</div><div class="v">Drag / Magnet</div><div class="d">سحب، احتكاك، سلوك لمس.</div></div>
          <div class="metric"><div class="k">UX layer</div><div class="v">Toast / Dialog</div><div class="d">واجهات مساعدة وطبقات عرض.</div></div>
        </div>
      </section>

      <div class="stack">
        <section class="panel section-anchor" id="motion">
          <div class="panel-head">
            <div>
              <h3>Motion Studio</h3>
              <div class="sub">اختبار tween و easing و repeat و yoyo و stagger و transforms.</div>
            </div>
            <span class="badge">core motion</span>
          </div>
          <div class="panel-body">
            <div class="grid-2">
              <div>
                <div class="stage" id="motionStage">
                  <div class="box" id="boxA" style="left:18px;top:18px">A</div>
                  <div class="box small round" id="boxB" style="left:130px;top:26px">B</div>
                  <div class="box small" id="boxC" style="left:220px;top:118px">C</div>
                  <div class="box outline" id="boxD" style="left:350px;top:60px">D</div>
                  <div class="hint">استعمل الأزرار أو شغّل العرض الكامل.</div>
                  <div class="corner">Move / scale / rotate</div>
                </div>
                <div class="spacer"></div>
                <div class="controls">
                  <button class="btn primary" id="btnMotionA">Tween</button>
                  <button class="btn alt" id="btnMotionB">Stagger</button>
                  <button class="btn soft" id="btnMotionC">Elastic</button>
                  <button class="btn" id="btnMotionD">Reverse</button>
                </div>
              </div>
              <div>
                <div class="codebox" id="motionLog">Ready.</div>
                <div class="spacer"></div>
                <div class="field">
                  <label>Duration</label>
                  <input type="range" min="200" max="2200" value="900" id="durRange">
                  <span class="badge mono" id="durValue">900ms</span>
                </div>
                <div class="spacer"></div>
                <div class="field">
                  <label>Easing</label>
                  <select id="easeSelect">
                    <option>easeOutCubic</option>
                    <option>easeOutBack</option>
                    <option>easeOutElastic</option>
                    <option>easeInOutCubic</option>
                    <option>linear</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="panel section-anchor" id="timeline">
          <div class="panel-head">
            <div>
              <h3>Timeline Lab</h3>
              <div class="sub">عرض التسلسل، labels، pause/play، scrubbing، وإعادة التحكّم.</div>
            </div>
            <span class="badge">sequence</span>
          </div>
          <div class="panel-body">
            <div class="grid-2">
              <div>
                <div class="stage" style="min-height:340px;padding:18px">
                  <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:10px">
                    <div class="badge">Timeline engine</div>
                    <div class="badge">labels / calls / sync</div>
                  </div>
                  <div class="bars" id="bars">
                    <div class="bar" style="height:38%"><span>Intro</span></div>
                    <div class="bar" style="height:72%"><span>Build</span></div>
                    <div class="bar" style="height:56%"><span>Peak</span></div>
                    <div class="bar" style="height:26%"><span>Outro</span></div>
                  </div>
                  <div class="hint">هذا القسم يوضح كيف يمكن للمكتبة أن تدير أنيميشن متسلسلًا بدل الحركة المنفردة.</div>
                </div>
                <div class="spacer"></div>
                <div class="controls">
                  <button class="btn primary" id="timelinePlay">Play Timeline</button>
                  <button class="btn alt" id="timelinePause">Pause</button>
                  <button class="btn soft" id="timelineScrub">Scrub</button>
                  <button class="btn" id="timelineLabels">Labels</button>
                </div>
              </div>
              <div>
                <div class="codebox" id="timelineLog">timeline ready</div>
                <div class="spacer"></div>
                <div class="field">
                  <label>Progress</label>
                  <input type="range" min="0" max="100" value="0" id="timelineRange">
                  <span class="badge mono" id="timelineValue">0%</span>
                </div>
                <div class="spacer"></div>
                <div class="pill-list" id="timelinePills">
                  <button class="pill active">Intro</button>
                  <button class="pill">Build</button>
                  <button class="pill">Peak</button>
                  <button class="pill">Outro</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="panel section-anchor" id="scroll">
          <div class="panel-head">
            <div>
              <h3>Scroll Theater</h3>
              <div class="sub">تمرير طويل مع parallax و reveal و pin و progress markers.</div>
            </div>
            <span class="badge">scroll trigger</span>
          </div>
          <div class="panel-body">
            <div class="grid-2">
              <div>
                <div class="stage tall" id="scrollStage" style="padding:18px;overflow:auto">
                  <div style="height:1080px;display:flex;flex-direction:column;justify-content:space-between">
                    <div>
                      <div class="badge">Scroll start</div>
                      <h4 style="margin:14px 0 8px;font-size:32px;line-height:1.1">Reveal / Pin / Snap</h4>
                      <p style="margin:0;color:var(--muted);line-height:1.85;max-width:520px">ارفع هذا القسم لعرض قدرات المكتبة في التعامل مع المسافات والتتابع ومحاكاة حركة السينما.</p>
                    </div>
                    <div class="mini-grid">
                      <div class="mini"><strong>Reveal</strong><span>ظهور متدرج بالعناصر.</span></div>
                      <div class="mini"><strong>Pin</strong><span>تثبيت عنصر أثناء التمرير.</span></div>
                      <div class="mini"><strong>Snap</strong><span>الالتقاط إلى نقاط.</span></div>
                      <div class="mini"><strong>Parallax</strong><span>عمق وحركة خلفية.</span></div>
                    </div>
                    <div>
                      <div class="badge">Scroll progress</div>
                      <div class="codebox" id="scrollLog">0%</div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div class="codebox" id="scrollApi">scroll trigger demo</div>
                <div class="spacer"></div>
                <div class="controls">
                  <button class="btn primary" id="scrollRevealBtn">Reveal</button>
                  <button class="btn alt" id="scrollPinBtn">Pin Mode</button>
                  <button class="btn soft" id="scrollSnapBtn">Snap</button>
                </div>
                <div class="spacer"></div>
                <div class="tag-row">
                  <span class="tag">markers</span><span class="tag">scrub</span><span class="tag">onEnter</span><span class="tag">onLeave</span>
                  <span class="tag">start/end</span><span class="tag">viewport</span><span class="tag">smooth scroll</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="panel section-anchor" id="flip">
          <div class="panel-head">
            <div>
              <h3>FLIP / Morph Lab</h3>
              <div class="sub">إعادة ترتيب العناصر وتحوّلها بصريًا بين حالات مختلفة.</div>
            </div>
            <span class="badge">layout transform</span>
          </div>
          <div class="panel-body">
            <div class="grid-2">
              <div>
                <div class="mini-grid" id="flipGrid" style="grid-template-columns:repeat(2,minmax(0,1fr))">
                  <div class="mini"><strong>Tile A</strong><span>Thumbnail morph</span></div>
                  <div class="mini"><strong>Tile B</strong><span>Reparent / reorder</span></div>
                  <div class="mini"><strong>Tile C</strong><span>Cross fade</span></div>
                  <div class="mini"><strong>Tile D</strong><span>Scroll linked</span></div>
                </div>
                <div class="spacer"></div>
                <div class="controls">
                  <button class="btn primary" id="flipBtn">Run FLIP</button>
                  <button class="btn alt" id="morphBtn">Morph Layout</button>
                  <button class="btn soft" id="swapBtn">Swap Grid</button>
                </div>
              </div>
              <div>
                <div class="codebox" id="flipLog">FLIP ready</div>
                <div class="spacer"></div>
                <div class="stage" style="min-height:220px;padding:16px">
                  <div class="box small round" style="left:20px;top:20px">1</div>
                  <div class="box small" style="left:110px;top:40px">2</div>
                  <div class="box small round" style="left:210px;top:84px">3</div>
                  <div class="box small outline" style="left:320px;top:124px">4</div>
                  <div class="hint">هذا مجرد playground بصري إضافي للفهم السريع.</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="panel section-anchor" id="text">
          <div class="panel-head">
            <div>
              <h3>Text Lab</h3>
              <div class="sub">typewriter / split chars / words / lines / scramble / reveal.</div>
            </div>
            <span class="badge">text engine</span>
          </div>
          <div class="panel-body">
            <div class="grid-2">
              <div>
                <div class="text-demo" id="textDemo">Premiumotion<span class="accent">Craft</span></div>
                <div class="spacer"></div>
                <div class="controls">
                  <button class="btn primary" id="typeBtn">Typewriter</button>
                  <button class="btn alt" id="splitBtn">Split Reveal</button>
                  <button class="btn soft" id="scrambleBtn">Scramble</button>
                  <button class="btn" id="linesBtn">Lines</button>
                </div>
                <div class="spacer"></div>
                <div class="field">
                  <label>Text preset</label>
                  <select id="textPreset">
                    <option>PremiumotionCraft</option>
                    <option>Motion, refined.</option>
                    <option>Effects, staged properly.</option>
                    <option>Build interfaces, not noise.</option>
                  </select>
                </div>
              </div>
              <div>
                <div class="log" id="textLog"></div>
              </div>
            </div>
          </div>
        </section>

        <section class="panel section-anchor" id="interaction">
          <div class="panel-head">
            <div>
              <h3>Interaction Lab</h3>
              <div class="sub">drag / inertia / snap / magnetic hover / cursor ring / bounds.</div>
            </div>
            <span class="badge">interaction core</span>
          </div>
          <div class="panel-body">
            <div class="grid-2">
              <div>
                <div class="stage" id="dragStage">
                  <div class="box" id="dragBox" style="left:26px;top:26px;background:linear-gradient(135deg,#ef6a6a,#d2aa62)">DRAG</div>
                  <div class="box small" id="mag1" style="left:260px;top:40px;background:linear-gradient(135deg,#39b8a7,#7c8cff)">MAG</div>
                  <div class="box small round" id="mag2" style="left:370px;top:150px;background:linear-gradient(135deg,#7c8cff,#ef6a6a)">HOV</div>
                  <div class="hint">حرّك المربعات واختبر الإحساس الحركي.</div>
                </div>
                <div class="spacer"></div>
                <div class="controls">
                  <button class="btn primary" id="dragReset">Reset Drag</button>
                  <button class="btn alt" id="magneticBtn">Magnetic</button>
                  <button class="btn soft" id="cursorBtn">Cursor FX</button>
                </div>
              </div>
              <div>
                <div class="codebox" id="interactionLog">interaction ready</div>
                <div class="spacer"></div>
                <div class="field">
                  <label>Snap step</label>
                  <input type="range" min="0" max="100" value="20" id="snapRange">
                  <span class="badge mono" id="snapValue">20</span>
                </div>
                <div class="spacer"></div>
                <div class="field">
                  <label>Friction</label>
                  <input type="range" min="80" max="99" value="92" id="frictionRange">
                  <span class="badge mono" id="frictionValue">0.92</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="panel section-anchor" id="ui">
          <div class="panel-head">
            <div>
              <h3>UI & Overlays</h3>
              <div class="sub">dialogs / toast / tooltips / menus / accordion / overlays.</div>
            </div>
            <span class="badge">ui layer</span>
          </div>
          <div class="panel-body">
            <div class="grid-3">
              <div class="mini"><strong>Dialog</strong><span>overlay / focus / close controls</span><button class="btn primary" id="dialogBtn">Open Dialog</button></div>
              <div class="mini"><strong>Toast</strong><span>short queue / stack</span><button class="btn alt" id="toastBtn">Show Toast</button></div>
              <div class="mini"><strong>Tooltip</strong><span>hover helpers / hints</span><button class="btn soft" id="tipBtn">Show Hint</button></div>
            </div>
            <div class="spacer"></div>
            <div class="grid-2">
              <div class="codebox" id="uiLog">ui ready</div>
              <div>
                <div class="stage" style="min-height:220px;padding:18px">
                  <div class="badge">accordion / menu / badge / modal</div>
                  <div class="spacer"></div>
                  <div class="pill-list" id="uiMenu">
                    <button class="pill active">Open</button>
                    <button class="pill">Close</button>
                    <button class="pill">Stack</button>
                    <button class="pill">Glass</button>
                  </div>
                  <div class="spacer"></div>
                  <div class="tag-row">
                    <span class="tag">tooltips</span><span class="tag">toasts</span><span class="tag">modals</span><span class="tag">menus</span>
                    <span class="tag">accordion</span><span class="tag">focus trap</span><span class="tag">glass</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="panel section-anchor" id="gallery">
          <div class="panel-head">
            <div>
              <h3>Showcase Gallery</h3>
              <div class="sub">أفقي، سينمائي، مناسب لعرض الصور أو اللقطات أو المشاريع.</div>
            </div>
            <span class="badge">showcase</span>
          </div>
          <div class="panel-body">
            <div class="gallery" id="galleryTrack">
              <div class="item"><img alt="demo 1" src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80"><div class="cap">Showcase 01 — motion and depth</div></div>
              <div class="item"><img alt="demo 2" src="https://images.unsplash.com/photo-1526378722484-bd91ca387e72?auto=format&fit=crop&w=1200&q=80"><div class="cap">Showcase 02 — transition and stage</div></div>
              <div class="item"><img alt="demo 3" src="https://images.unsplash.com/photo-1484417894907-623942c8ee29?auto=format&fit=crop&w=1200&q=80"><div class="cap">Showcase 03 — cinematic gallery</div></div>
              <div class="item"><img alt="demo 4" src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80"><div class="cap">Showcase 04 — deep visual flow</div></div>
            </div>
            <div class="spacer"></div>
            <div class="controls">
              <button class="btn primary" id="galleryScrollBtn">Auto Scroll</button>
              <button class="btn alt" id="galleryLightboxBtn">Lightbox</button>
              <button class="btn soft" id="galleryShuffleBtn">Shuffle</button>
            </div>
          </div>
        </section>

        <section class="panel section-anchor" id="diagnostics">
          <div class="panel-head">
            <div>
              <h3>Diagnostics / API Map</h3>
              <div class="sub">كشف ما هو متاح من المكتبة داخل هذه الواجهة تلقائيًا.</div>
            </div>
            <span class="badge">inspector</span>
          </div>
          <div class="panel-body">
            <div class="grid-2">
              <div>
                <div class="grid-6" id="diagGrid">
                  <div class="mini"><strong>Motion</strong><span>Tween</span></div>
                  <div class="mini"><strong>Sequence</strong><span>Timeline</span></div>
                  <div class="mini"><strong>Scroll</strong><span>Trigger</span></div>
                  <div class="mini"><strong>Layout</strong><span>FLIP</span></div>
                  <div class="mini"><strong>Input</strong><span>Drag</span></div>
                  <div class="mini"><strong>Text</strong><span>Split</span></div>
                </div>
                <div class="spacer"></div>
                <div class="controls">
                  <button class="btn primary" id="scanBtn">Scan API</button>
                  <button class="btn alt" id="openOverlayBtn">Overlay</button>
                </div>
              </div>
              <div>
                <div class="codebox" id="apiBox">Loading...</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div class="footer">
        هذه واجهة عرض واحدة قابلة للتوسعة. عدّل مسار ملف المكتبة في الأسفل إذا كان الاسم مختلفًا.
      </div>
    </main>
  </div>

  <div class="drawer" id="drawer">
    <div class="inner">
      <div class="top">
        <div>
          <h4>Inspector</h4>
          <div class="s">لوحة تشغيل سريعة لاختبار قدرات المكتبة كما تُعرض في صفحات demo الاحترافية.</div>
        </div>
        <button class="btn danger" id="closeDrawerBtn">Close</button>
      </div>
      <div class="controls">
        <button class="btn primary" id="drawerRun">Run All</button>
        <button class="btn alt" id="drawerToast">Toast</button>
        <button class="btn soft" id="drawerFlip">FLIP</button>
        <button class="btn" id="drawerText">Text</button>
      </div>
    </div>
  </div>

  <div class="drawer" id="dialogOverlay" style="right:18px;left:auto;bottom:auto;top:18px;width:min(620px,calc(100vw - 36px))">
    <div class="inner">
      <div class="top">
        <div>
          <h4>Overlay Demo</h4>
          <div class="s">يمكنك استخدام هذه الطبقة لإظهار dialog / modal / focus state / transitions.</div>
        </div>
        <button class="btn danger" id="closeOverlayBtn">Close</button>
      </div>
      <div class="grid-3">
        <div class="mini"><strong>Preset</strong><span>elastic / smooth</span></div>
        <div class="mini"><strong>Preset</strong><span>magnetic / sticky</span></div>
        <div class="mini"><strong>Preset</strong><span>cinematic / glass</span></div>
      </div>
    </div>
  </div>

  <script src="./premiumotioncraft-ultimate(1).js"></script>
  <script>
    const $ = (s, r=document) => r.querySelector(s);
    const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
    const lib = () => window.premiumotioncraft || null;

    const state = {
      dragStart: null,
      dragOrigin: null,
      dragging: false,
      cursorEnabled: false,
      savedFlipOrder: null,
      timer: null
    };

    const log = (el, msg) => {
      const now = new Date().toLocaleTimeString();
      el.textContent = `[${now}] ${msg}
` + el.textContent;
    };

    const statusTitle = $('#statusTitle');
    const statusSub = $('#statusSub');
    const apiBox = $('#apiBox');
    const motionLog = $('#motionLog');
    const timelineLog = $('#timelineLog');
    const scrollApi = $('#scrollApi');
    const scrollLog = $('#scrollLog');
    const flipLog = $('#flipLog');
    const textLog = $('#textLog');
    const interactionLog = $('#interactionLog');
    const uiLog = $('#uiLog');

    function featureSummary(){
      const api = lib();
      if(!api){
        statusTitle.textContent = 'Library missing';
        statusSub.textContent = 'Please fix the JS path';
        apiBox.textContent = 'PremiumotionCraft library was not found.
Check the script src at the bottom of the page.';
        return false;
      }
      const keys = Object.keys(api).sort();
      statusTitle.textContent = 'Loaded';
      statusSub.textContent = `${keys.length} exported entries detected`;
      apiBox.textContent = `PremiumotionCraft is loaded.

Exported keys:
${keys.join(', ')}

Use this page to exercise motion, scroll, FLIP, text, UI, drag, cursor, and showcase behavior.`;
      return true;
    }

    function setProgress(target, value){
      target.style.setProperty('--progress', value);
    }

    const durRange = $('#durRange');
    const durValue = $('#durValue');
    const easeSelect = $('#easeSelect');
    durRange.addEventListener('input', () => durValue.textContent = `${durRange.value}ms`);

    const timelineRange = $('#timelineRange');
    const timelineValue = $('#timelineValue');
    timelineRange.addEventListener('input', () => timelineValue.textContent = `${timelineRange.value}%`);

    const snapRange = $('#snapRange');
    const snapValue = $('#snapValue');
    snapRange.addEventListener('input', () => snapValue.textContent = snapRange.value);

    const frictionRange = $('#frictionRange');
    const frictionValue = $('#frictionValue');
    frictionRange.addEventListener('input', () => frictionValue.textContent = (frictionRange.value/100).toFixed(2));

    function animateBox(sel, vars){
      const api = lib(); if(!api) return;
      try {
        if(api.animate) return api.animate(sel, vars);
        if(api.tween) return api.tween(sel, vars);
      } catch (e) {
        log(motionLog, `Animation error: ${e.message}`);
      }
    }

    function tweenBoxes(){
      const d = Number(durRange.value) / 1000;
      const ease = easeSelect.value;
      log(motionLog, `Tween boxes — ${d}s, ${ease}`);
      animateBox('#boxA', { x: 160, y: 28, rotate: 360, scale: 1.12, duration: d, ease });
      animateBox('#boxB', { x: 240, y: 88, rotate: -180, duration: d * .9, ease });
      animateBox('#boxC', { x: 66, y: 160, scale: 1.28, duration: d, ease: 'easeOutBack' });
      animateBox('#boxD', { x: -122, y: 120, rotate: 12, duration: d * 1.05, ease: 'easeInOutCubic' });
    }

    function staggerBoxes(){
      log(motionLog, 'Stagger sequence');
      ['#boxA','#boxB','#boxC','#boxD'].forEach((sel, i) => setTimeout(() => animateBox(sel, {
        y: (i % 2 ? 74 : -26),
        scale: 1.08,
        rotate: i * 12,
        duration: 0.38,
        ease: 'easeOutCubic',
        yoyo: true,
        repeat: 1
      }), i * 110));
    }

    function elasticBox(){
      log(motionLog, 'Elastic pop');
      animateBox('#boxC', { scale: 1.55, rotate: 24, duration: 0.22, ease: 'easeOutElastic', yoyo: true, repeat: 3 });
    }

    function reverseBoxes(){
      log(motionLog, 'Reverse direction');
      animateBox('#boxA', { x: 0, y: 0, rotate: 0, scale: 1, duration: 0.8, ease: 'easeOutCubic' });
      animateBox('#boxB', { x: 0, y: 0, rotate: 0, duration: 0.8, ease: 'easeOutCubic' });
      animateBox('#boxC', { x: 0, y: 0, scale: 1, duration: 0.8, ease: 'easeOutCubic' });
      animateBox('#boxD', { x: 0, y: 0, rotate: 0, duration: 0.8, ease: 'easeOutCubic' });
    }

    $('#btnMotionA').onclick = tweenBoxes;
    $('#btnMotionB').onclick = staggerBoxes;
    $('#btnMotionC').onclick = elasticBox;
    $('#btnMotionD').onclick = reverseBoxes;

    function playTimeline(){
      log(timelineLog, 'Timeline: play');
      const bars = $$('#bars .bar');
      bars.forEach((bar, i) => {
        bar.animate([
          { transform: 'scaleY(.55)', filter: 'brightness(.9)' },
          { transform: `scaleY(${1 + i * .15})`, filter: 'brightness(1.15)' },
          { transform: 'scaleY(1)', filter: 'brightness(1)' }
        ], { duration: 900, easing: 'cubic-bezier(0.16,1,0.3,1)', delay: i * 120, fill: 'both' });
      });
      timelineRange.value = 100;
      timelineValue.textContent = '100%';
    }

    function pauseTimeline(){
      log(timelineLog, 'Timeline: pause (visual demo only)');
    }

    function scrubTimeline(){
      const p = Number(timelineRange.value) / 100;
      log(timelineLog, `Scrub: ${timelineRange.value}%`);
      $$('#bars .bar').forEach((bar, i) => {
        const scale = 0.45 + p * (0.55 + i * .13);
        bar.style.transform = `scaleY(${scale})`;
      });
    }

    function labelTimeline(){
      const current = $$('#timelinePills .pill.active')[0];
      log(timelineLog, `Label selected: ${current ? current.textContent : 'none'}`);
    }

    $('#timelinePlay').onclick = playTimeline;
    $('#timelinePause').onclick = pauseTimeline;
    $('#timelineScrub').onclick = scrubTimeline;
    $('#timelineLabels').onclick = labelTimeline;
    timelineRange.addEventListener('input', scrubTimeline);
    $$('#timelinePills .pill').forEach(btn => btn.addEventListener('click', () => {
      $$('#timelinePills .pill').forEach(x => x.classList.remove('active'));
      btn.classList.add('active');
      labelTimeline();
    }));

    const scrollStage = $('#scrollStage');
    scrollStage.addEventListener('scroll', () => {
      const max = scrollStage.scrollHeight - scrollStage.clientHeight || 1;
      const p = Math.round((scrollStage.scrollTop / max) * 100);
      scrollLog.textContent = `${p}%`;
      scrollApi.textContent = `Scroll stage progress: ${p}%`;
    });
    $('#scrollRevealBtn').onclick = () => {
      log(scrollApi, 'Reveal mode');
      scrollStage.scrollTo({ top: 0, behavior: 'smooth' });
    };
    $('#scrollPinBtn').onclick = () => log(scrollApi, 'Pin mode requested');
    $('#scrollSnapBtn').onclick = () => log(scrollApi, 'Snap mode requested');

    function flipLayout(){
      const grid = $('#flipGrid');
      const items = $$('.mini', grid);
      if(!state.savedFlipOrder) state.savedFlipOrder = items.slice();
      const order = [items[2], items[0], items[3], items[1]];
      order.forEach(el => grid.appendChild(el));
      log(flipLog, 'FLIP / reorder');
      items.forEach((el, i) => {
        el.animate([
          { transform: 'scale(.88) translateY(6px)', opacity: .55 },
          { transform: 'scale(1) translateY(0)', opacity: 1 }
        ], { duration: 460 + i * 40, easing: 'cubic-bezier(0.16,1,0.3,1)', fill: 'both' });
      });
    }

    function morphLayout(){
      const grid = $('#flipGrid');
      grid.style.gridTemplateColumns = '1.25fr .75fr';
      setTimeout(() => grid.style.gridTemplateColumns = 'repeat(2,minmax(0,1fr))', 1200);
      flipLayout();
      log(flipLog, 'Morph layout sequence');
    }

    function swapGrid(){
      const grid = $('#flipGrid');
      const items = $$('.mini', grid);
      if(state.savedFlipOrder) state.savedFlipOrder.forEach(el => grid.appendChild(el));
      else items.reverse().forEach(el => grid.appendChild(el));
      log(flipLog, 'Swap grid order');
    }

    $('#flipBtn').onclick = flipLayout;
    $('#morphBtn').onclick = morphLayout;
    $('#swapBtn').onclick = swapGrid;

    const textPreset = $('#textPreset');
    function currentText(){ return textPreset.value; }

    function typewriter(text){
      const el = $('#textDemo');
      el.textContent = '';
      let i = 0;
      const iv = setInterval(() => {
        el.textContent += text[i++] || '';
        if(i > text.length){ clearInterval(iv); log(textLog, `typewriter: ${text}`); }
      }, 38);
    }
    function splitReveal(text){
      const el = $('#textDemo');
      el.innerHTML = text.split('').map((ch, i) => `<span style="display:inline-block;opacity:0;transform:translateY(18px);animation:r .42s ${i * .018}s forwards">${ch === ' ' ? '&nbsp;' : ch}</span>`).join('');
      const style = document.createElement('style');
      style.textContent = '@keyframes r{to{opacity:1;transform:translateY(0)}}';
      document.head.appendChild(style);
      setTimeout(() => style.remove(), 900);
      log(textLog, `split reveal: ${text}`);
    }
    function scramble(text){
      const el = $('#textDemo');
      const pool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
      let iterations = 0;
      const max = text.length * 9;
      const iv = setInterval(() => {
        el.textContent = text.split('').map((ch, i) => {
          if(i < Math.floor(iterations / 9)) return ch;
          return pool[Math.floor(Math.random() * pool.length)];
        }).join('');
        iterations++;
        if(iterations > max){ clearInterval(iv); el.innerHTML = text.replace('Craft', '<span class="accent">Craft</span>').replace('Motion', '<span class="accent2">Motion</span>'); log(textLog, `scramble: ${text}`); }
      }, 28);
    }
    function linesReveal(text){
      const el = $('#textDemo');
      const parts = text.split(' ');
      el.innerHTML = parts.map((part, i) => `<span style="display:block;opacity:0;transform:translateY(16px);animation:l .36s ${i * .08}s forwards">${part}</span>`).join(' ');
      const style = document.createElement('style');
      style.textContent = '@keyframes l{to{opacity:1;transform:translateY(0)}}';
      document.head.appendChild(style);
      setTimeout(() => style.remove(), 1000);
      log(textLog, `lines/words: ${text}`);
    }

    $('#typeBtn').onclick = () => typewriter(currentText());
    $('#splitBtn').onclick = () => splitReveal(currentText());
    $('#scrambleBtn').onclick = () => scramble(currentText());
    $('#linesBtn').onclick = () => linesReveal(currentText());

    function resetDrag(){
      const d = $('#dragBox');
      d.style.left = '26px'; d.style.top = '26px'; d.style.transform = '';
      log(interactionLog, 'drag reset');
    }
    function magneticMode(){
      log(interactionLog, 'magnetic hover requested');
      $$('#interaction .box').forEach(el => {
        el.addEventListener('mousemove', e => {
          const r = el.getBoundingClientRect();
          const x = ((e.clientX - r.left) / r.width - .5) * 14;
          const y = ((e.clientY - r.top) / r.height - .5) * 14;
          el.style.transform = `translate(${x}px, ${y}px) scale(1.03)`;
        });
        el.addEventListener('mouseleave', () => el.style.transform = '');
      });
    }
    function cursorFX(){
      state.cursorEnabled = !state.cursorEnabled;
      $('#cursorRing').classList.toggle('show', state.cursorEnabled);
      document.body.style.cursor = state.cursorEnabled ? 'none' : '';
      log(interactionLog, `cursor FX ${state.cursorEnabled ? 'enabled' : 'disabled'}`);
    }
    $('#dragReset').onclick = resetDrag;
    $('#magneticBtn').onclick = magneticMode;
    $('#cursorBtn').onclick = cursorFX;

    // Manual drag fallback (works even if library doesn't expose a drag helper in browser)
    (function initDragFallback(){
      const box = $('#dragBox');
      let dragging = false, startX = 0, startY = 0, originX = 0, originY = 0;
      box.addEventListener('pointerdown', e => {
        dragging = true;
        box.setPointerCapture(e.pointerId);
        startX = e.clientX;
        startY = e.clientY;
        originX = box.offsetLeft;
        originY = box.offsetTop;
        log(interactionLog, 'drag start');
      });
      box.addEventListener('pointermove', e => {
        if(!dragging) return;
        const nx = Math.max(0, Math.min(380, originX + (e.clientX - startX)));
        const ny = Math.max(0, Math.min(210, originY + (e.clientY - startY)));
        box.style.left = nx + 'px';
        box.style.top = ny + 'px';
      });
      box.addEventListener('pointerup', () => {
        if(dragging) log(interactionLog, 'drag end');
        dragging = false;
      });
    })();

    $('#dialogBtn').onclick = () => { $('#dialogOverlay').classList.add('open'); log(uiLog, 'dialog open'); };
    $('#toastBtn').onclick = () => { log(uiLog, 'toast requested'); alert('Toast demo: اربطها بدالة toast داخل المكتبة أو استبدلها بمركز إشعارات داخل الصفحة.'); };
    $('#tipBtn').onclick = () => { log(uiLog, 'tooltip requested'); alert('Tooltip demo: يمكنك استبدالها بتلميحات حقيقية من المكتبة.'); };
    $('#closeOverlayBtn').onclick = () => $('#dialogOverlay').classList.remove('open');
    $('#openOverlayBtn').onclick = () => $('#dialogOverlay').classList.add('open');

    $('#uiMenu').addEventListener('click', e => {
      if(!e.target.classList.contains('pill')) return;
      $$('#uiMenu .pill').forEach(x => x.classList.remove('active'));
      e.target.classList.add('active');
      log(uiLog, `menu state: ${e.target.textContent}`);
    });

    $('#galleryScrollBtn').onclick = () => {
      $('#galleryTrack').scrollBy({ left: 420, behavior: 'smooth' });
      log(uiLog, 'gallery auto scroll');
    };
    $('#galleryLightboxBtn').onclick = () => {
      const img = $('#galleryTrack .item img');
      if(!img) return;
      $('#dialogOverlay').classList.add('open');
      $('#dialogOverlay .inner').innerHTML = `
        <div class="top"><div><h4>Lightbox</h4><div class="s">عرض صورة داخل طبقة عزل كاملة.</div></div><button class="btn danger" id="lbClose">Close</button></div>
        <img src="${img.src}" alt="lightbox" style="width:100%;border-radius:20px;display:block">
      `;
      $('#lbClose').onclick = () => { location.reload(); };
      log(uiLog, 'lightbox open');
    };
    $('#galleryShuffleBtn').onclick = () => {
      const track = $('#galleryTrack');
      const items = $$('#galleryTrack .item');
      items.sort(() => Math.random() - 0.5).forEach(el => track.appendChild(el));
      log(uiLog, 'gallery shuffled');
    };

    function killAll(){
      const api = lib();
      if(api && api.killAll){
        try { api.killAll(); log(uiLog, 'killAll executed'); } catch (e) { log(uiLog, `killAll failed: ${e.message}`); }
      } else {
        log(uiLog, 'killAll unavailable');
      }
    }

    function runAll(){
      tweenBoxes();
      setTimeout(staggerBoxes, 180);
      setTimeout(elasticBox, 420);
      setTimeout(playTimeline, 680);
      setTimeout(() => scrollStage.scrollTo({ top: 340, behavior: 'smooth' }), 980);
      setTimeout(flipLayout, 1250);
      setTimeout(morphLayout, 1500);
      setTimeout(() => typewriter(currentText()), 1800);
      setTimeout(() => splitReveal(currentText()), 2300);
      setTimeout(() => $('#dragBox').style.transform = 'translate(14px, 8px)', 2750);
      setTimeout(() => $('#dialogOverlay').classList.add('open'), 3100);
      log(uiLog, 'full showcase started');
    }

    $('#runAllBtn').onclick = runAll;
    $('#heroRun').onclick = runAll;
    $('#drawerRun').onclick = runAll;
    $('#killBtn').onclick = killAll;
    $('#resetBtn').onclick = () => location.reload();
    $('#openDrawerBtn').onclick = () => $('#drawer').classList.add('open');
    $('#closeDrawerBtn').onclick = () => $('#drawer').classList.remove('open');
    $('#drawerToast').onclick = () => alert('Drawer toast demo');
    $('#drawerFlip').onclick = flipLayout;
    $('#drawerText').onclick = () => typewriter(currentText());
    $('#heroModal').onclick = () => $('#dialogOverlay').classList.add('open');

    // scroll progress for sidebar active links
    const anchors = ['hero','motion','timeline','scroll','flip','text','interaction','ui','gallery','diagnostics'].map(id => document.getElementById(id));
    const navLinks = $$('#nav a');
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          navLinks.forEach(a => a.classList.remove('active'));
          const id = entry.target.id;
          const link = navLinks.find(a => a.getAttribute('href') === `#${id}`);
          if(link) link.classList.add('active');
        }
      });
    }, { rootMargin: '-35% 0px -55% 0px', threshold: .05 });
    anchors.forEach(el => el && io.observe(el));

    // cursor ring
    const ring = $('#cursorRing');
    document.addEventListener('pointermove', e => {
      ring.style.left = e.clientX + 'px';
      ring.style.top = e.clientY + 'px';
    });

    // diagnostics scanning
    $('#scanBtn').onclick = () => {
      const api = lib();
      if(!api) return featureSummary();
      const keys = Object.keys(api).sort();
      apiBox.textContent = `Exported API (${keys.length})

${keys.map((k, i) => `${String(i+1).padStart(2,'0')}. ${k}`).join('
')}`;
      log(uiLog, 'API scan complete');
    };

    $('#openOverlayBtn').onclick = () => $('#dialogOverlay').classList.add('open');

    // sidebar buttons to make the interface feel like a product demo page
    $('#heroModal').addEventListener('click', () => log(uiLog, 'overlay requested from hero'));
    $('#heroRun').addEventListener('click', () => log(uiLog, 'run all requested from hero'));

    // Initial states
    featureSummary();
    log(motionLog, 'Motion studio ready');
    log(timelineLog, 'Timeline lab ready');
    log(textLog, 'Text lab ready');
    log(interactionLog, 'Interaction lab ready');
    log(uiLog, 'UI layer ready');
    scrollApi.textContent = 'Scroll stage progress: 0%';
    scrollLog.textContent = '0%';
    $('#timelineValue').textContent = '0%';
    $('#durValue').textContent = `${durRange.value}ms`;
    $('#snapValue').textContent = snapRange.value;
    $('#frictionValue').textContent = (frictionRange.value/100).toFixed(2);
    $('#timelineRange').dispatchEvent(new Event('input'));

    // expose helper for easy console testing
    window.PCShowcase = { runAll, tweenBoxes, staggerBoxes, playTimeline, flipLayout, morphLayout, killAll };
  </script>
</body>
</html>
