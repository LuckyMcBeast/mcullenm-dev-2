# Introducing stoglr - the Simple Feature Toggler
##### 04-10-2025

Last year, I was working with an enterprise client who had a knack for sending software to production that wasn't quite ready. After warning them about the potential risks serveral times, inevitably something unfinished went to production and actually had an impact on their business. This drew attention to the comments that I had made about the importance of feature toggles and, subsequently, I was tasked with providing them with options to implement them. I offered them a few different solutions:

- Use an out of the box solution like Unleash or Lauchdarkly
- Use AWS AppConfig Feature Flags, since our environment is AWS based
- Implement our own ultra-simple solution

After some debate, the client decided that the third option would be the best choice initially, as it would not require additional approval and would have a more limited impact on the budget. I also promised them that I could deliver a very rudimentary version of our in-house feature toggle system within two days. I am proud to say that I delivered on that promise and expanded on that system over about four weeks, adding a web UI, additional toggle types, and SDKs for the two main languages we used (Kotlin and TypeScript). As of today, this system is still in use across their development journey, a collection of 6 software teams.

Though that system is proprietry, I used the same princples I used to design that system to build an open source version written in Go. That system is called [*stoglr*](https://github.com/LuckyMcBeast/stoglr), the simple feature toggler.

### Why build yet another feature toggle system?

Really just one reason: simplicity. Most feature toggle systems are very featureful, with lots of bells and whistles that move away from the very simple idea of having an on/off switch for a feature. In my experience, the mere existance of a feature encourages its use and adds unnecessary complexity. I wanted to create something as straightforward as possible while still being able to handle complex scenarios.

### Wait, what is a feature toggle anyway?

A feature toggle is a technique used in software development to hide or expose new features. It's often used when developing and testing new features, allowing developers to turn them on and off as needed without having to deploy a new version of the application every time. Feature toggles are an essential part of Continuous Integration and Coninuous Delivery (CI/CD), as true CI requires that all code is merged together at least daily and true CD requires that all passing builds are deployed to a production-like environment at more or less the same pace.

In the case of stoglr, it supports 3 types of toggles:

- Release Toggles: Toggles that are meant to prevent the unintended release of a feature and should be removed upon release. stoglr will enventually enforce this by preventing release toggles from being turned on in production (though at the time of writing, it is not yet implemented).
- Ops Toggles: Toggles that can be used to enable or disable a feature in any environment. A use case for this toggle might be the transition from one external system to another, in which we may desire to go back to the previous solution.
- A/B Toggles: Toggles that are used to provide two experiences to the end user. Currently, this can only be done on a percentage basis. This is valuable when for UX testing. In the future, stoglr will also support A/B groups allowing experiences to be split by specific attributes.

stoglr's toggles are represented by the following struct:

```go
type Toggle struct {
	//Name of the toggle
	Name       string     `json:"name"` 
	//Current status of the toggle (enabled or disabled, 
	//among other informative statuses like not found etc.)
	Status     Status     `json:"status"`
	//The type of the toggle (Release, Feature, or A/B)
	ToggleType ToggleType `json:"toggleType"`
	//The execution percentage for an A/B toggle. Set 
	//to 100 for all other toggles.
	Executes   int        `json:"executes"`
}
```


### How does stoglr work?

stoglr has two parts:

- Server application: maintains the state of toggles, acts as a basic CRUD application with a basic UI
- Client libraries/SDKs: exposes the only necessary function for using the system with another code base

The server is designed to be run standalone, but can be executed in other services. The client libraries are meant to be used within your own applications. As of writing, stoglr only has one client library and that is included in the stoglr go package under lib. In the near future, I plan to support rust, python, kotlin, java, and javascript, with more languages to be added as the project matures. Though there is a REST API as well, that is primarily for use with UI and the client libraries.

Here's a simple usage example in Go:

```go
package main

import (
	"fmt"
	"github.com/LuckyMcBeast/stoglr/lib"
)

func main() {

	// Creates a client that points to the specified stoglr server
	s := lib.NewStoglrClient("some-url-to-stoglr-server")

	// Checks if the toggle "myToggle" is enabled or not. 
	// If the toggle does not exist, it will create the toggle 
	// in a disabled state.
	if s.IsEnabled(lib.ReleaseStoglr("myToggle")) {
		fmt.Println("Toggle is enabled")
	} else {
		fmt.Println("Toggle is disabled")
	}

	// Checks if the Ops toggle "myOpsToggle" is enabled or not. 
	// If the toggle does not exist, it will create the toggle 
	// in a disabled state.
	if s.IsEnabled(lib.OpsStoglr("myOpsToggle")) {
		fmt.Println("Ops Toggle is enabled")
	} else {
		fmt.Println("Ops Toggle is disabled")
	}

	// Checks if the A/B test toggle "myAbTestToggle" is enabled or not.
	// If the toggle does not exist, it will create the toggle
    //  in a disabled state and with a 50% chance of executing 
    // if it is enabled. Note: If the toggle exists, this will not
    // change the existing toggle's execution percentage. 
	if s.IsEnabled(lib.ABStoglr("myAbTestToggle", 50)) {
		fmt.Println("A/B Test Toggle is enabled")
	} else  {
		fmt.Println("A/B Test Toggle is disabled")
	}

}
```

Changing toggle state and execution percentage is done primarily through the UI of the stoglr server. It could be done programmatically by making HTTP requests to the appropriate endpoints, but is not included in the SDK. This is because the enablement of toggled code should be a very intentional choice. One could, however, have a use case in which they might want to enable a toggle after passing some automated checks, so the option is there. I would still proceed with caution when enabling or disabling features programmatically.

All of that being said the UI looks like this:

![stoglr-ui](https://github.com/LuckyMcBeast/stoglr/raw/main/ui_image.png)

It's usage should be fairly intuitive. The is one page at the root of the url where you can see all toggles, their current states, their execution percentages with the ability to update them (A/B only), a button to change the state of each toggle, and a button to delete each toggle.

### A peak under the hood

#### HTTP Web Server

stoglr primarily uses the Go standard library for its functionality, with heavy use of the [net/http](https://pkg.go.dev/net/http) package. The standard library is one of the most attractive features of the Go programming language, as the standard library provides almost everything one could need to create a modern application out of the box. With the addition of ServerMux, setting up routes is pretty straightforward:

```go
    func (tr *ToggleRouter) CreateRouter() *http.ServeMux {
	return tr.setupUi().
		handleAll(
			Handler{"GET /api/health", tr.getHealth},
			Handler{"GET /api/toggle", tr.getAll},
			Handler{"POST /api/toggle/{name}", tr.createOrGet},
			Handler{"PUT /api/toggle/{name}/change", tr.change},
			Handler{"DELETE /api/toggle/{name}", tr.delete},
			Handler{"PUT /api/toggle/{name}/execute", tr.executes},
			Handler{"PUT /api/toggle/{name}/execute/{executes}", tr.executes},
		).getServeMux()
    }

    func (tr *ToggleRouter) setupUi() Mux {
	tr.mux.handleAll(
		Handler{
			"GET /",
			func(w http.ResponseWriter, r *http.Request) {
				tmpl := template.Must(template.ParseFiles("static/index.html"))
				err := tmpl.Execute(w, model.NewTogglesByType(tr.datastore.GetAllToggles()))
				if err != nil {
					log.Println(err)
				}
			},
		},
		Handler{
			"GET /simple.min.css",
			func(w http.ResponseWriter, r *http.Request) {
				writeFile("static/simple.min.css", "text/css; charset=utf-8", w)
			},
		},
		Handler{
			"GET /style.css",
			func(w http.ResponseWriter, r *http.Request) {
				writeFile("static/style.css", "text/css; charset=utf-8", w)
			},
		},
		Handler{
			"GET /htmx.min.js",
			func(w http.ResponseWriter, r *http.Request) {
				writeFile("static/htmx.min.js", "text/javascript; charset=utf-8", w)
			},
		},
	)
	return tr.mux
}
```

As shown above, the UI is established first, by serving a few static files: 
- the index page which acts a the UI
- simple.css as the styling framework and style.css for custom styles
- htmx to add dynamic behavior to the site

After that, the REST API routes are set, all of which are prefixed with `/api`:

- `GET /health` - returns a simple health check response (OK in plain text with 200 if up)
- `GET /toggle` - returns all toggles as JSON
- `POST /toggle/{name}` - creates a new toggle with the specified name, has optional parameters of type and executes (default is Release type), returns the create toggle as JSON
- `PUT /toggle/{name}/change` - toggles between enabled and disabled state of the specified feature, returns the updated toggle as either HTML or JSON based on Accept header
- `PUT /toggle/{name}/execute` - sets execution percentage for an A/B toggle using form input, returns the updated toggle as either HTML or JSON based on Accept header
- `PUT /toggle/{name}/execute/{executes}` - sets execution percentage for an A/B toggle using path value, returns the updated toggle as either HTML or JSON based on Accept header
- `DELETE /toggle/{name}` - deletes a specific toggle by its name, returns the updated toggle as either HTML or JSON based on Accept header

The creation method is probably the most interesting of the bunch. Going slightly against normal conventions, the creation method is also a getter for existing toggles. This is done so the IsEnabled method in the client libraries can be used to both create and fetch a toggle. If the toggle exist, it will return the state of that toggle, changing nothing about the toggle itself, but if it does not exist, it creates one with the specified parameters that is disabled.

The reason many of these methods return two types of responses (HTML or JSON) is because they are used in different contexts: some might be called from a browser to display information, while also having a use case for being called with the SDK or a REST client, where JSON is more appropriate. The Accept header is used to determine specifically whether or not JSON should be returned. If anything else is passed, the default will be HTML.

#### Templ and HTMX - Templating Reactive HTML

Because this a server-side application that is monolythic in nature, using something like React would add unnecessary complexity and an additional layer to the application. Instead, I opted for [HTMX](https://htmx.org/) which is lightweight and easy to integrate with existing HTML projects. It allows you to make HTTP requests from HTML without refreshing the page (providing similar behavior to React) while maintaining a hypertext focus. This pairs extremely well with [templ](https://templ.guide/), a lightweight templating engine designed specifically for Go, providing the only other benefit of using of using a React-like javascript library, i.e. reusable components. The UI's templ with HTMX is as follows:

```go
templ ToggleHtml(t *Toggle) {
    <tr id={ t.Name }>
        <td>{ t.Name }</td>
        <td>{ string(t.Status) }</td>
    if t.ToggleType == AB {
        <td class="executes">
            <form hx-put={ "/api/toggle/" + t.Name + "/execute" }
                  hx-target={ "#" + t.Name }
                  hx-swap="outerHTML"
            >
                <input type="text"
                       name="executes"
                       id={ t.Name + "-executes" }
                       placeholder={ strconv.Itoa(t.Executes) }>
                <button>update</button>
            </form>
        </td>
        }
    <td>
        <button class="tbutton"
             hx-put={ "/api/toggle/" + t.Name + "/change" }
             hx-target={ "#" + t.Name }
             hx-swap="outerHTML">toggle</button>
        <button class="dbutton"
             hx-delete={ "/api/toggle/" + t.Name }
             hx-target={ "#" + t.Name }
             hx-swap="outerHTML">delete</button>
        </td>
    </tr>
}
```

#### Managing a Toggle's State

The state of the each toggle at the time of writing lives in-memory and is not persisted across restarts. However, because of the Get-Create concept mentioned earlier, when a toggle is triggered after a restart, it will be created again in the disabled start. Essientially, the toggle is persisted in the codebase, which allows Stoglr to be stateless.

```go
package datastore

import (
	"github.com/LuckyMcBeast/stoglr/model"
)

type Datastore interface {
	CreateOrGetToggle(name string, toggleType string, executes string) model.Toggle
	ChangeToggle(name string) model.Toggle
	GetAllToggles() []model.Toggle
	DeleteToggle(name string) model.Toggle
	SetExecution(name string, executes string) model.Toggle
}
```

### What's next?

Despite what was stated about state (hehe) in the last section, one of the next steps for stoglr is to implement an adapter for state persistence, with direct implementations for MongoDB and PostgreSQL.

Additionally, to enhance stoglr's availablity and scalablity when using the in-memory datastore, there are plans to implement a decentralized system for multiple instances of stoglr to communicate and propagate state to one another.

Finally, client SDKs for the following languages are in the works:

- Java
- Kotlin
- Rust
- Python
- Javascript

### Inspiration

A lot of the inspiration from this system comes from [an article on Martin Fowler's blog](https://martinfowler.com/articles/feature-toggles.html). It offers a comprehensive guide to feature toggling, it's benefits, and various toggle type.




