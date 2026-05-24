import React from "react";
import "../styles/ArtGallery.css";
import "../styles/Projects.css";
import "../styles/ProjectLog.css";
import FadeInSection from "./FadeInSection";
import { Link, useParams } from "react-router-dom";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import InstagramIcon from "@mui/icons-material/Instagram";

const projectLogs = {
  "pc": {
    title: "Building my first PC: the Rei build",
    date: "May 2023",
    description: "My first build with an AMD Ryzen 7 5800X and an RTX 4070 Ti. This was made with the intention of high-end video gaming, game development, and machine learning.",
    image: "/assets/hardware/pc/images/header.png",
    logs: [
      {
        title: "0. where it started",
        content: [
          { type: "text", value: "I didn't pick white because it was trending. I picked white because of Rei Ayanami. If you know, you know. Neon Genesis Evangelion has this whole color language around Rei: white plugsuit, pale skin, quiet and a little strange. I wanted the build to feel like that. Something cold but also clean." },
          { type: "text", value: "I even put a Rei figure inside the case once it was done, tucked in the corner behind the GPU. That aesthetic decision made everything else downstream easier. White case, white motherboard shroud, white pump head on the AIO, white GPU cooler. Once you commit to a standard, you stop second-guessing individual parts." },
          { type: "image", value: "/assets/hardware/pc/images/extra.png" }
        ]
      },
      {
        title: "1. picking parts",
        content: [
          { type: "text", value: "Start with PCPartPicker. Seriously, use it before you buy a single thing. It checks compatibility automatically and tracks price history so you know if something is on sale or just perpetually listed at a fake discount." },
          { type: "text", value: "The most important compatibility relationship is CPU to motherboard. They have to share the same socket. I was on AMD's AM4 platform, so my Ryzen 7 5800X and NZXT N7 B550 board just work together without any adapters." },
          { type: "list", title: "Complete list of my parts:", items: [
            "CPU: AMD Ryzen 7 5800X, 8 cores",
            "Cooler: NZXT Kraken Z63 RGB, 280mm AIO liquid cooler",
            "Motherboard: NZXT N7 B550, white shroud",
            "RAM: Corsair Vengeance RGB Pro, 32GB DDR4-3200",
            "Storage: Samsung 970 Evo Plus 1TB NVMe",
            "GPU: Gigabyte AERO OC RTX 4070 Ti",
            "Case: HYTE Y60",
            "PSU: EVGA SuperNOVA 850W Gold (SFX form factor)",
            "Fans: Lian Li Uni Fan SL, mix of 120mm and 140mm"
          ]}
        ]
      },
      {
        title: "2. the case",
        content: [
          { type: "text", value: "The HYTE Y60 is the whole reason this build looks the way it does. The front and right side panels are one continuous wraparound piece of tempered glass. The inside of the case is the display." },
          { type: "text", value: "Before I even installed a single part, I sat and thought about where every cable was going to run." },
          { type: "tip", value: "Buy white or braided cables that match your theme. Use a lot of velcro tape to tie them all together." },
          { type: "image", value: "/assets/hardware/pc/images/extra2.png" }
        ]
      },
      {
        title: "3. motherboard outside the case first",
        content: [
          { type: "text", value: "This is the move that separates a calm build from a frustrating one. Before the board goes into the case, do this on the box it came in:" },
          { type: "list", items: [
            "Seat the CPU (lift the lever, drop it in, it only fits one way, never force it)",
            "Install the RAM (push down until both clips click, do it with some force, they resist)",
            "Slot in the NVMe SSD (tiny M.2 stick, goes in at an angle, screw it flat)"
          ]},
          { type: "text", value: "Doing this on a flat surface with good lighting means you're not doing it blind inside a case. The CPU especially: you get one shot before you're bending pins." },
          { type: "tip", value: "Ground yourself before touching anything. Static discharge can kill components silently and you won't know until the first boot fails." }
        ]
      },
      {
        title: "4. the AIO cooler",
        content: [
          { type: "text", value: "The Kraken Z63 is a 280mm radiator, meaning it has two 140mm fans attached to it. It mounts to the top of the Y60. The hoses attach to the CPU block and route up to the radiator." },
          { type: "text", value: "The order matters: mount the fans to the radiator first, then mount the radiator to the case, then route the hoses down to the CPU. Don't do it the other way around or you'll be twisting the hoses in awkward angles." },
          { type: "text", value: "The CPU block has thermal paste pre-applied. Don't add more unless you clean it off first." }
        ]
      },
      {
        title: "6. the GPU",
        content: [
          { type: "text", value: "The RTX 4070 Ti AERO OC is a triple-fan card and it is big. It seats in the top PCIe x16 slot. Push it in until you hear the clip at the end of the slot click. Then screw it to the case's expansion bracket at the back." },
          { type: "text", value: "The Y60 has a built-in GPU support bracket because HYTE knows that a card this heavy will physically sag over time and stress the slot. Use it. It takes two minutes to clip in." },
          { type: "text", value: "The GPU needs two 8-pin PCIe power connectors from the PSU. Route those cables so they enter from the side closest to the case edge, not across the face of the GPU where they'll be visible through the glass." },
          { type: "image", value: "/assets/hardware/pc/images/extra3.png" }
        ]
      },
      {
        title: "7. fans",
        content: [
          { type: "text", value: "Lian Li Uni fans are the cleanest fan solution I've found for a build like this. They daisy-chain: each fan connects to the next, and one cable runs back to the controller. For a case where cables are visible, going from eight individual cables to two is significant." },
          { type: "text", value: "I ran 120mm fans at the top (mounted to the radiator) and 140mm fans on the side panel. The airflow direction matters: top fans exhaust out, side fans bring air in across the GPU." },
          { type: "tip", value: "Check which way airflow goes before you mount fans. There's a small arrow on the frame showing airflow direction. It's easy to install them backwards." }
        ]
      },
      {
        title: "8. first boot",
        content: [
          { type: "text", value: "This is the moment. Everything is in. You plug in the monitor, keyboard, and power. You press the button." },
          { type: "text", value: "Either something happens or nothing does." },
          { type: "text", value: "Mine worked on the first try although I was really terrified it would not. I genuinely sat back and stared for about a minute." },
          { type: "text", value: "The only advice I would give here is to be very meticulous with each part. I advise following a YouTube tutorial closely and/or instructions from whatever AI you prefer. Do not do guesswork and document everything. It helps when things fall apart." },
          { type: "text", value: "Anyway, after that Windows was installed in twelve minutes and then GPU drivers from Nvidia's site." }
        ]
      },
      {
        title: "How it looks now",
        content: [
          { type: "text", value: "I like this build especially because it reads quiet and deliberate, the same way Rei does. It's not screaming for attention with aggressive RGB. It just sits there looking cold, and if you look close enough you notice the figure, and then you either get it or you don't." },
          { type: "text", value: "That's the build." }
        ]
      }
    ]
  },
  "grass-cyberdeck": {
    title: "Grass Cyberdeck build",
    date: "May 2026",
    description: "I wanted a tiny computer that played old Pokemon, lived inside a wooden box, and looked like something a forest witch would own if forest witches did retro emulation.",
    badge: { text: "Featured in Teen Vogue", href: "https://www.teenvogue.com/story/diy-cyberdecks-newest-analog-trend-taking-social-media" },
    image: "/assets/hardware/grass-cyberdeck/header.JPG",
    imageCaption: "the first time it booted Pokemon, lid open, moss not even glued in yet",
    heroStyle: { maxWidth: "60%", margin: "40px auto" },
    logs: [
      {
        title: "0. where it started",
        content: [
          { type: "text", value: "I didn't set out to build a \"cyberdeck.\" I set out to play Pokemon Red in a way that felt like mine. Everyone has the games on their phone. That's exactly why I didn't want them on my phone. I wanted to open a little wooden box, see a screen glow up out of a bed of moss, and play the same game I played as a kid but through something I'd actually made with my hands." },
          { type: "text", value: "I'm not a hardware person. The plan was an 8 x 5 x 3 inch wooden keepsake box (the kind sold for jewelry), stuffed with just enough computer to run Game Boy games, and decorated like a tiny terrarium." },
          { type: "text", value: "A handheld that's also a houseplant." }
        ]
      },
      {
        title: "1. the parts",
        content: [
          { type: "text", value: "I'm listing these the way I wish someone had explained them to me, because I bought the wrong version of two things before I understood what I was looking at." },
          { type: "list", items: [
            "The brain: Raspberry Pi 3B+. I started out wanting the tiny Pi Zero 2W, and honestly it would have run Pokemon fine. I switched to the 3B+ because the power board I wanted attaches more reliably to it, and because I figured I might want the headroom later.",
            "The power: PiSugar 3 Plus. This is the part that makes it portable. It's a 5000mAh battery that clips onto the back of the Pi using little spring-loaded pogo pins (no soldering, no GPIO pins used up). It charges over USB-C and does a clean safe-shutdown so you don't corrupt your save file by yanking the power. This gets you something like 8–10 hours.",
            "The screen: Hosyond 5\" DSI touchscreen. Connects to the Pi with a flat ribbon cable instead of a bulky HDMI plug, which matters a lot when you're trying to close a small lid. More on the word \"touchscreen\" later.",
            "The keyboard: Rii Mini Bluetooth keyboard. About the size of a deck of cards. The keys are tiny. You're not writing essays on this. You're typing the occasional command. It's perfect for that and miserable for anything more.",
            "The controller: 8BitDo Micro. A pocket-sized Bluetooth gamepad. This is what you actually play with. It's the size of a stick of gum and it's genuinely good.",
            "The decoration: preserved reindeer moss and sheet moss. Two kinds. Flat moss as a carpet, fluffy moss to fill the corners.",
            "The box: a wood keepsake box with a Tree of Life carved into the lid, which felt thematically perfect for something I was about to fill with moss."
          ]}
        ]
      },
      {
        title: "2. the layout",
        content: [
          { type: "text", value: "There's no real \"circuit\" here the way a soldered project has one. That's the funny thing about this build. Once I dropped the idea of a wired voltmeter, almost every connection is either a clip-on or wireless." },
          { type: "diagram", value: "LID  ┌───────────────────────────────┐\n     │   [ Hosyond 5\" screen ]        │\n     └───────────────┬───────────────┘\n                     │ DSI ribbon cable\n                     │ (round the hinge)\nBASE ┌───────────────┴───────────────┐\n     │  [ Pi 3B+ ]                    │\n     │     ↑ pogo pins (no cable)     │\n     │  [ PiSugar 3 Plus battery ]    │\n     │     ↑ USB-C charging           │\n     │                                │\n     │  ((( Bluetooth )))             │\n     │     → Rii keyboard             │\n     │     → 8BitDo Micro             │\n     │     → headphones               │\n     │                                │\n     │  moss everywhere else          │\n     └────────────────────────────────┘" },
          { type: "text", value: "Screen in the lid, brain in the base, ribbon cable bending around the hinge between them, everything else talking over Bluetooth or just sitting there looking nice." }
        ]
      },
      {
        title: "3. things that went wrong",
        content: [
          { type: "text", value: "The assembly plan was clean. Reality was not. Here's the actual order things went wrong, because the wrong turns are the only useful part of a build log." },
          { type: "text", value: "The card reader: My MacBook has an SD slot but my microSD didn't come with the adapter, and I didn't own a USB stick either. The entire project sat in a pile on my desk for two days waiting on an $8 dongle. Order the boring connecting parts first, before the exciting parts, because the exciting parts are useless without them." },
          { type: "text", value: "The ribbon cable was too short: The screen came with a 10cm DSI cable. That sounds like plenty until you remember the screen is in the lid and the Pi is in the base and the cable has to bend around a hinge. 10cm pulled tight. I had to order a 20cm one and wait again." },
          { type: "text", value: "The WiFi nearly broke me: The Pi refused to connect, wouldn't even scan for networks. The answer was that the Pi won't touch WiFi at all until you set the WLAN country code. One setting buried in a menu. Once I set it to US and dropped a wifikeyfile.txt onto the boot partition, it grabbed an IP address on the next reboot." },
          { type: "text", value: "The keyboard pretended to charge: I plugged the keyboard into the Pi to use it over USB and it just glowed red and did nothing as an input. Turns out red meant charging, not connecting. It needed to be switched into the right mode." },
          { type: "text", value: "And then, after all of it (the card reader, the cable, the touch dead-end, the WiFi country code, the keyboard mode), I dragged a Pokemon Red file into a folder over my home network, restarted the menu, and there it was. Game Boy category. One game in it. I pressed A on a gamepad the size of my thumb and the title screen came up on a screen sitting in a wooden box on my desk." },
        ]
      },
      {
        title: "4. why a cyberdeck, though",
        content: [
          { type: "text", value: "The word \"cyberdeck\" comes from cyberpunk fiction. In William Gibson's Neuromancer, a \"deck\" was the console hackers jacked into to enter cyberspace. I wrote my grade 12 English paper on that book, so when the maker community claimed the name, it already felt like mine. They ran with it, and now a cyberdeck means a custom-built, often deliberately rugged or weird personal computer. Not a laptop. Not a thing you bought. A thing you assembled, that does exactly what you want and nothing you don't, and that looks like you." },
          { type: "text", value: "That's the actual appeal, and it took building one to feel it. Every device I own is a sealed black rectangle. I can't open my phone. I can't see how my laptop works. They're all identical to everyone else's and designed to be replaced, not repaired, not understood. A cyberdeck is the opposite of that on every axis. It shows its seams. You can open it. When something breaks you fix the specific thing that broke." },
          { type: "text", value: "And then there's the moss, which is the part people raise an eyebrow at. Cyberpunk is usually all chrome and neon and rain. But I kept thinking about the opposite: what tech looks like when something living grows over it. There's a whole softer cousin of cyberpunk called solarpunk that's about exactly this: technology and nature not at war. A circuit board in a bed of moss isn't a contradiction. It's a little argument that the future doesn't have to be cold. My computer has a houseplant in it. I think that's the most honest thing I've ever built." }
        ]
      },
    ]
  },
  "led-bracelet": {
    title: "a Sound-Reactive LED Bracelet",
    date: "April 2026",
    description: "I wanted to build a wearable, sound-reactive LED bracelet that pulses to music in real-time for Coachella.",
    image: "/assets/hardware/led-bracelet/header.jpg",
    imageCaption: "right after i got it working, before the design",
    reelsLink: "https://www.instagram.com/gazisj/reel/DXJyl1CkQxB/",
    logs: [
      {
        title: "0. where it started",
        content: [
          { type: "text", value: "For Coachella, everyone shows up with their fits planned out for weeks and I wanted something that felt actually mine. So I thought: what if it's something that reacted to the music in real time?" },
          { type: "text", value: "I'm a Computer Science student so I figured okay, how hard can hardware be. I write code every day. A microcontroller is basically just a tiny computer right. Wrong. Well, kind of wrong. The coding part was genuinely easy. Everything else humbled me pretty fast." },
          { type: "text", value: "The vision was simple: a bracelet that pulses and lights up to whatever music is playing around it. Wear it at night, looks insane under stage lights, and costs less than a festival food order." }
        ]
      },
      {
        title: "1. the parts",
        content: [
          { type: "text", value: "I want to be upfront, I did not know what half of these things were when I ordered them. I'm listing them the way I wish someone had listed them for me. Everything here is cheap, ships fast on Amazon, and most of the tools you buy once and reuse forever." },
          { type: "list", items: [
            "The brain: Seeed Studio XIAO RP2040. This is your microcontroller. Think of it like a Raspberry Pi but smaller than a stick of gum. It runs your code and talks to everything else.",
            "The lights: DIYmall WS2812B 8-bit LED Ring. Eight individually addressable RGB LEDs arranged in a circle. Each one can be any color independently.",
            "The microphone: MAX4466 Electret Microphone Amplifier. This little blue board picks up sound from the air and converts it into a voltage signal your microcontroller can read.",
            "The battery: EEMB 3.7V 350mAh LiPo. Flat pouch battery, rechargeable. Small enough to sit on the underside of a bracelet band.",
            "The charger: HiLetgo TP4056 Type-C. This little board sits between your battery and your microcontroller. Plug USB-C into it and it charges the battery safely."
          ]},
          { type: "tip", value: "The soldering iron is the one thing worth spending a little more on -- get a Pinecil. Everything else is whatever's cheapest." }
        ]
      },
      {
        title: "2. the circuit",
        content: [
          { type: "text", value: "This is the whole thing. Seriously, it is not complicated once you see it drawn out." },
          { type: "diagram", value: "                   +------------------+\n                    |   XIAO RP2040    |\n    +----------+    |                  |\n    | MAX4466  |    |  3V3 <-- VCC     |\n    |  (mic)   |    |  GND <-- GND     |\n    |          |    |  A0  <-- OUT     |\n    +----------+    |                  |\n                    |  VCC --> 5V      |\n    +----------+    |  GND --> GND     |    +-----------+\n    | WS2812B  |    |  D1  --> DIN     |    |  TP4056   |\n    | LED Ring |    |                  |    | (charger) |\n    +----------+    |  VIN <-- OUT+    |    |           |\n                    |  GND <-- OUT-    |    | B+ <-- battery red  |\n                    +------------------+    | B- <-- battery blk  |\n                                           +-----------+" },
          { type: "text", value: "That's it. Six connections for the mic and LED ring, four connections for the battery and charger. Ten solder joints total." },
          { type: "text", value: "The mic reads sound as an analog voltage on pin A0. The code samples that voltage really fast, figures out how loud it is, and tells the LED ring how many lights to turn on and what color." }
        ]
      },
      {
        title: "3. soldering",
        content: [
          { type: "text", value: "I had never soldered before this. My mental image of it was something you needed years of practice for, like some specialized trade skill." },
          { type: "text", value: "It is not that. It is closer to using a really precise hot glue gun. The iron melts a metal called solder onto two surfaces and when it cools, those surfaces are permanently connected both physically and electrically." },
          { type: "text", value: "The thing that actually helped me was understanding what a good joint looks like versus a bad one. Good joints are shiny and smooth, kind of volcano shaped. Bad joints are dull and grey and crumbly looking. If yours looks dull just reheat it for two seconds and it fixes itself. You can always redo it." },
          { type: "tip", value: "Tin both surfaces before joining them. Tinning means coating each surface with a thin layer of solder before you connect them. Once both surfaces are pre-coated, joining them is just touching them together and applying heat for two seconds." }
        ]
      },
      {
        title: "4. the code",
        content: [
          { type: "text", value: "If you are a CS student this part will feel like home. It is basically just: read a value, map it to a range, update some LEDs." },
          { type: "code", value: "#include <Adafruit_NeoPixel.h>\n\n#define MIC_PIN     A0\n#define LED_PIN     D1\n#define NUM_LEDS    8\n#define SAMPLE_WINDOW   50\n#define NOISE_FLOOR     10\n#define SMOOTHING       0.25f\n\nAdafruit_NeoPixel ring(NUM_LEDS, LED_PIN, NEO_GRB + NEO_KHZ800);\nfloat smoothedLevel = 0;\n\nvoid setup() {\n  ring.begin();\n  ring.setBrightness(80);\n  ring.show();\n}\n\nvoid loop() {\n  unsigned long start = millis();\n  int minVal = 1023, maxVal = 0;\n\n  while (millis() - start < SAMPLE_WINDOW) {\n    int sample = analogRead(MIC_PIN);\n    if (sample > maxVal) maxVal = sample;\n    if (sample < minVal) minVal = sample;\n  }\n\n  int peakToPeak = max(0, (maxVal - minVal) - NOISE_FLOOR);\n  smoothedLevel = smoothedLevel * (1.0f - SMOOTHING)\n                + (float)peakToPeak * SMOOTHING;\n\n  int litLEDs = map((int)smoothedLevel, 0, 300, 0, NUM_LEDS);\n  litLEDs = constrain(litLEDs, 0, NUM_LEDS);\n\n  ring.clear();\n  for (int i = 0; i < litLEDs; i++) {\n    float t = (float)i / (NUM_LEDS - 1);\n    uint8_t r = (uint8_t)(t * 255);\n    uint8_t g = (uint8_t)((1.0f - t) * 200);\n    ring.setPixelColor(i, ring.Color(r, g, 0));\n  }\n  ring.show();\n}" },
          { type: "text", value: "The smoothing value is the most interesting part to play with. Low smoothing and the LEDs are super reactive and jumpy. High smoothing and they kind of breathe and flow. I landed on 0.25 which feels natural without being chaotic. The 300 in the map function is your calibration number. Open the serial plotter in Arduino IDE, make noise, watch the peaks, adjust that number to match what you actually see." }
        ]
      },
      {
        title: "5. the aesthetic problem",
        content: [
          { type: "text", value: "Here is the honest part. When I first got it working it looked terrible. White elastic band, components stuck on with hot glue blobs, wires going in every direction, electrical tape patches everywhere. It worked but it looked like something from a middle school science fair." },
          { type: "text", value: "For Coachella that is not good enough." },
          { type: "text", value: "The fix was mostly about discipline rather than buying more stuff. I redid the whole assembly with one rule: if you can see it from the top, it has to look intentional. Every wire got rerouted to the underside of the band and tacked down flat with thin strips of black tape. The hot glue blobs came off and got replaced with E6000 adhesive which dries clear and holds way stronger. I painted every solder joint with liquid electrical tape from Home Depot, which dries black and flexible and makes everything look like it came off a factory line." }
        ]
      },
      {
        title: "6. what i learned",
        content: [
          { type: "text", value: "Hardware has a different failure mode than software. In software when something breaks there is usually a stack trace, an error message, some breadcrumb pointing you somewhere. In hardware something just does not work and you have to reason backwards from nothing. The LED ring did not light up on battery power for a while and the answer turned out to be that the VCC pin on the XIAO only gets 5V when USB is connected. Switching to the 3V3 pin fixed it." },
          { type: "text", value: "The other thing is that small batteries die fast. 350mAh sounds like a number until you realize eight LEDs at full brightness can drain it in under ten minutes. Dropping brightness from 150 to 80 in the code tripled battery life." },
          { type: "text", value: "If you are a Computer Science person who has never done hardware before, the gap is smaller than it looks. The hard part is debugging without a console, which is just a different muscle you have not built yet." }
        ]
      }
    ]
  }
};

const ProjectLog = () => {
  const { projectId } = useParams();

  const renderContent = (content) => {
    return content.map((item, i) => {
      switch (item.type) {
        case "text":
          return <p key={i} className="article-text">{item.value}</p>;
        case "image":
          return (
            <div key={i} className="article-image-container">
              <img src={item.value} alt="Project detail" className="article-image" />
            </div>
          );
        case "list":
          return (
            <div key={i} className="article-list-container">
              {item.title && <div className="article-list-title">{item.title}</div>}
              <ul className="article-list">
                {item.items.map((li, j) => <li key={j}>{li}</li>)}
              </ul>
            </div>
          );
        case "tip":
          return <div key={i} className="article-tip">{item.value}</div>;
        case "code":
          return (
            <div key={i} className="article-code-container">
              <pre className="article-code">
                <code>{item.value}</code>
              </pre>
            </div>
          );
        case "diagram":
          return (
            <div key={i} className="article-diagram-container">
              <pre className="article-diagram">{item.value}</pre>
            </div>
          );
        default:
          return null;
      }
    });
  };

  if (!projectId || !projectLogs[projectId]) {
    return (
      <div className="project-log-page">
        <div className="section-header">
          <Link to="/" className="back-button">
            <ArrowBackRoundedIcon />
          </Link>
          <span className="section-title">/ project not found</span>
        </div>
      </div>
    );
  }

  const project = projectLogs[projectId];

  return (
    <div className="project-log-page">
      <div className="section-header">
        <Link to="/" className="back-button">
          <ArrowBackRoundedIcon />
        </Link>
        <span className="section-title">/ project log</span>
      </div>
      
      <FadeInSection delay="200ms">
        <div className="project-log-header">
          <h1 className="project-log-title">{project.title}</h1>
          
          {project.image && (
            <div className="project-log-hero-wrapper" style={project.heroStyle || {}}>
              <div className="project-log-hero-container">
                <img src={project.image} alt={project.title} className="project-log-hero" />
              </div>
              {project.imageCaption && (
                <p className="project-log-hero-caption">{project.imageCaption}</p>
              )}
            </div>
          )}

          <p className="project-log-description">{project.description}</p>
          {project.badge && (
            <a
              href={project.badge.href}
              target="_blank"
              rel="noopener noreferrer"
              className="project-badge"
            >
              {project.badge.text}
            </a>
          )}
          {project.date && <div className="project-log-date">{project.date}</div>}
        </div>
      </FadeInSection>

      {project.reelsLink && (
        <FadeInSection delay="300ms">
          <div className="reels-container">
            <a 
              href={project.reelsLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="project-reels-link"
            >
              <InstagramIcon className="reels-icon" />
              <span className="reels-text">Watch the build process on Instagram</span>
            </a>
          </div>
        </FadeInSection>
      )}

      <div className="project-log-container">
        {project.logs.map((log, i) => (
          <FadeInSection key={i} delay={(i + 1) * 100 + "ms"}>
            <section className="article-section">
              <div className="article-header">
                <h2 className="article-title">{log.title}</h2>
              </div>
              <div className="article-content">
                {renderContent(log.content)}
              </div>
            </section>
          </FadeInSection>
        ))}
      </div>
    </div>
  );
};

export default ProjectLog;
