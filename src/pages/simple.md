# Simple is Better: Redesigning this Site Again
##### 07-29-2024

The more I learn about software systems, the never ending list of web frameworks, and the inherited complexity that comes with them, the greater my desire has become to design intentionally simple systems. A redesign of this site has been on my mind since last year, shortly after I made my first major revision, which involved switching from an system using React, Spring Boot/Kotlin, FastAPI/Python, and Postgres to an system using Next.js, Spring Boot/Kotlin, and Postgres. In this process, I removed a redundant data abstraction layer, implemented static site generation along with static site regeneration (more can be read on this in my previous posts which I will list below). I also attempted to improve the look and feel of the site. In retrospec, I feel like the old site looked very busy (view that version of the site [here](https://old.mcullenm.dev)) and the complexity of multiple layers and two frameworks for what was essesstially a static site seemed, well, silly. 

## Inspiration

While looking into different tiling window managers/compositors for Wayland, I came across river, a dynamic tiling Wayland compositor, and subsequently my first inspiration for this redesign, [Issac Freund's website](https://isaacfreund.com/), the creator of river. I was struck by the site's elegance and simplity. This was back in April of 2023, which was a very demanding time in my life. I wanted to make changes then, but other pressing matters got in the way.

## Design Decisions

### Markdown is better for Writing: Wolfgang and Roman Zolotarev
As I've started to write more and more documentation for software systems, I've gotten really comfortable using Markdown. I honestly loathed writing articles for the old site, because it involved a translation layer which used JSON. Sure, I could have built a text editor and an interpreter to take "plain" text, convert it, and send that converted JSON to my API, **but** that just seemed like overkill.

I started exploring options about a month ago. The first option was Astro, which is a static site generating javascript framework (yaaay, another framework). In all seriousness, Astro looks really cool and if I was doing a bit more than I am currently, it might be a great choice, but as I was looking through the documentation one acronym kept coming to mind: *YAGNI - You aren't gonna need it*. Too much complexity and not enough value for this use case.

So, I kept looking and eventually stumbled upon a [video](https://youtu.be/N_ttw2Dihn8?si=2IC3o2qadHNEWE-x) on Wolfgang's YouTube Channel, where he discussed how he used a simple shell script written by Roman Zolotarev called [ssg](https://romanzolotarev.com/ssg.html) that converts markdown into HTML by using either Lowdown (my choice) or Markdown.pl. This was perfect. Simple and does only what I need it to do.

### Secure Self-Hosting and H2O Server
One aspect of web development that always seems to be offloaded to a service provider is the actual deployment and hosting of the service. Over the past several years, I have learned quite a bit about hosting a services in various ways, both in the cloud and on-prem. The cloud is the default option these days, whether that be through a smaller PaaS like Vercel or a major cloud provider like Amazon Web Services or Google Cloud Platform. These can be fine, especially if you can manage to keep your usage in the free tier, but most of the time it's kind of unnecessary, especially if you already self-hosting other services like I am (I'll write an article in the future about my homelab as well as how a start-up might be able to launch securely without a cloud provider).

Without going into too many details here, I'm using an open source hypervisor called Proxmox, which has similar feature to the commercial product VMWare, to host services at home. This, along with [Cloudflare Tunnels](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/), allows me to basically have my own cloud environment and much more control than I would have using a provider.

The main decision left for this aspect of the the site is how to server it. I considered using Kotlin with Netty via either Spring Boot or Ktor to serve webpages, but wanted something a little more barebones. Around the same time I started looking into Markdown static site generation, I learned about a *newer* HTTP server called [H2O](https://h2o.examp1e.net). H2O is supports HTTP/1, 2, and 3, is exceptionally fast, and boasts better performance than Nginx for static file serving. I wanted an excuse to try it out and this site seemed like the perfect opportunity. It's configuration is fairly straight forward:

```
hosts:
  default:
    listen:
      port: 8080
    paths:
      /:
        file.dir: /var/www/html
        file.dirlisting: OFF
        error-doc:
          status: 404
          url: /404.html
      /blog:
        file.dir: /var/www/html/pages
        file.index: ["../blog.html"]
        file.dirlisting: OFF
        error-doc:
          status: 404
          url: /404.html
access-log: /dev/stdout
error-log: /dev/stderr
```

### Do I need React? No, not really.
In the original design of the site, I used React to build the UI and continued this practice on the first revision while using Next.js. Now, I want to be clear, I have no qualms with React or JSX. I feel like it does have it's place. That being said, when I really thought about it, what reactivity did my site really have? All I was doing originally was updating state once I retrieved the blogs from the content management system. With the CMS no longer in play, the only thing I'd be missing out on was reusable components. Luckily, Web Components solve this problem.

If you aren't farmilar, [Web Components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components) are reusable, custom HTML elements which can be written in vanilla javascript. They have a simple API and allow for some client side reactivity if desired. They fit in well with my more minimal approach. One of the simplest components that I made was the `nav-bar`:

```js
import { attrTextContent } from "./helper.js"

class NavBar extends HTMLElement {
    constructor() {
        super()
        this.innerHTML = `
            <nav class="font-monospace join join-horizontal">
                <a href="/blog" 
                   class="btn btn-info ${attrTextContent("size", this)} join-item">
                   blog
                </a>
                <a href="mailto:cullen.mcclellan@mcullenm.dev" 
                   class="btn ${attrTextContent("size", this)} btn-error join-item">
                   contact
                </a>
            </nav>
        `
    }
}

customElements.define("nav-bar", NavBar)
```
Usage of the `nav-bar`:

``` html
<nav-bar size="btn-sm" />
```

This implementation doesn't use templates, slots, or the shadow dom, but if you are interested you take take a look at [SitePage.js](../components/SitePage.js) or any of my other components on [Github](https://github.com/LuckyMcBeast/mcullenm-dev-2/tree/main/src/components).

### Building and bundling the site: Make, a Container, and a Shell Script 
There are tons of build tool for websites. Vite and Webpack immediately come to mind. I didn't really want to use these, primarily, because I wanted to establish my own build process using the tools that I know.

#### make
Enter [make](https://linux.die.net/man/1/make), a simple GNU utility that is often used to compile and install low-level programs. Without going into too much detail, to use `make` you create a Makefile with the instructions that should be performed based to "make" whatever it is that you are making. My Makefile for this site looks like this:

```
ENGINE?=podman
CTNAME?=mcullenm_dev

build-start: generate-dist build-h2o create-h2o

rebuild: stop-h2o remove-h2o generate-dist build-h2o create-h2o

auto-rebuild:
	inotifywait -m -q -e modify src/* | while read l; do make rebuild; done

build-h2o:
	$(ENGINE) build -t mcullenm_dev_h2o .

generate-dist:
	./tools/generate.sh

create-h2o:
	$(ENGINE) run --name $(CTNAME) -p 8081:8080 -d mcullenm_dev_h2o

start-h2o:
	$(ENGINE) container start $(CTNAME)

stop-h2o:
	$(ENGINE) container stop $(CTNAME)

remove-h2o:
	$(ENGINE) container rm $(CTNAME)

```

The first two lines here are options that can be passed in. For example, the default ENGINE value is `podman`, but could be replaced with `docker` by running:

```
make ENGINE=docker
```

The first command is `build-start`, which is the default command. This means that running just `make` with no arguments, would execute the commands within `build-start`. Running any other command requires adding the command's name as an argument. For example, this is how you run the `rebuild` command:

```
make rebuild
```

The `build-start` and `rebuild` commands are also what I like to call *super commands*. They calls other commands within the Makefile in order.

The last command from the Makefile that I'd like to mention is the `auto-rebuild` command. This command runs until stopped and will rebuild the application on any file change within the project's `src` directory.

#### Containerization with podman and docker
As you may have noticed in the Makefile above, containers are a major part of the workflow. They make deployments easy and allow for an isolated, reproducible environment. When was the last time you saw a 3 line Dockerfile?

```
FROM lkwg82/h2o-http2-server

ADD dist /var/www/html
COPY h2o.conf .
```

You maybe wondering why I list both [podman](https://podman.io/) and docker. I actually prefer podman whenever possible, however, on my server I use docker because of services I run isn't compatible with podman. I really hope Docker Compose support in podman improves in the near future.

#### The Real Build Step: generate.sh
The final piece involved in this site's build system is a simple shell script; `generate.sh` executes all of the commands needed to produce a production version of the site:

```
#!/bin/sh -e
rm -rf dist
mkdir -p dist/pages
cp src/*.html dist
cp -r src/assets dist
cp dist/assets/favicon.ico dist
cp -r src/components dist
cp -r src/scripts dist
cp -r src/style dist
./tools/tailwindcss-extra -i ./src/style/style.css -o ./dist/style/style.css --minify
./tools/ssg src/pages dist/pages "M. Cullen McClellan - Blog" "https://mcullenm.dev/blog"
mv dist/pages/sitemap.xml dist/sitemap.xml
```

### Creating the Look and Feel

#### Tailwind CSS and daisyUI
To be completely honest, I've always been somewhat frustrated by UI design and styling. [Tailwind CSS](https://tailwindcss.com/) definitely makes this easier and I would rather not go without it. [daisyUI](https://daisyui.com/) takes Tailwind's declarative approach a step further by setting a unified color pallet and providing basic UI components. It was a bit of challenge to setup, since this site does not use node modules and daisyUI expects that you are. I was able to overcome this with the help of a modified version of the Tailwind CLI tool that is repackaged with DaisyUI, [tailwind-cli-extra](https://github.com/dobicinaitis/tailwind-cli-extra) by dobicinatis.

#### Gruvbox Dark Material Theme (Slightly Modified)
Gruvbox is by far one of the most popular base-16 color themes and one that I've been using in the terminal for quite a while. The material version has an 8 color palette, which is great when you don't actually need 16 unique colors. I applied this theme in my `tailwind.config.js` with an additional color that I selected myself (base-200), nine colors in total:

```
gruvboxmaterial: {
    "base-content": "#D4BE98", //offwhite
    "neutral-content": "#D4BE98", //offwhite
    "primary": "#89B482", //seafoam
    "secondary": "#A9B665", //green
    "accent": "#D3869B", //purple
    "neutral": "#3C3836", //charcoal
    "base-100": "#3C3836", //charcoal
    "base-200": "#2a292e", //dark navy
    "info": "#7DAEA3", //blue
    "success": "#A9B665", //green
    "warning": "#D8A657", //yellow
    "error": "#EA6962", //red
    }
```

See this theme in action with DaisyUI [here](../style-example.html).

#### Blog Page Styling and Highlight.js
Styling the blog pages could be partially done with Tailwind and daisyUI, specifically for the header and footer, but the HTML generated from Markdown would need to be styled differently, as the ssg utility has no understanding of the framework. To keep things as simple as possible, I created a style sheet specifically for the blog pages. One thing was still laking, however, syntax highlighting for code. To solve this, I included [highlight.js](https://highlightjs.org/) as minified script in the project.

## Retrospective and Conclusion
I am very happy with the new site. I feel like it's much cleaner, is very performant, and has none of the weirdness that I faced in previous versions from time to time (for example, service restarts without cause and static site elements revert back to previously compiled version on Vercel after Incremental Site Regeneration). The system is simple overall and I absolutely love the build system. 

That being said, I am considering adding another feature: users with email authentication and comments, which will mean some sort of backend system. I will likely use [htmx](https://htmx.org/) to facilitate interactions with that system on the frontend.

#### Other posts about the evolution of this site:
- [Original site design article](original-site.html)
- [First revision article](first-rev.html)

