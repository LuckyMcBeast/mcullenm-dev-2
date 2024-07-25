# REST: What it is and How to Use it
##### 02-25-2022

A few months ago, I was pairing with a colleague of mine and was asked if I understood REST. Of course, I said yes, because I had briefly skimmed over a document over a year ago that talked about the pattern. I knew what made a GET request a GET request and what made a POST request a POST request. Heck, I even knew that PUTs could create new records, if they didn’t already exist, though its primary function is a full update of a domain object. I had lots of status codes memorized. That’s enough, right? Well, as I came to find out it isn’t quite enough and I was kind of missing the whole point of REST in the first place. What I was describing was merely HTTP protocol, not REST, and though they may seem similar on the surface, they are not the same. In fact, HTTP was influenced by REST, not the other way around.

### So, what really is REST?

REST, or Representational State Transfer, is an API architectural design pattern for delivering content from a server to a client. This pattern imposes constraints on the design and functionality of an API that, if followed by the APIs designer, create a uniform, scalable and flexible API. For an API to be considered RESTful, it needs to follow most (if not all) of the pattern’s constraints, which are as follows:

1. **Uniform Interface**: Restful APIs are designed to deliver a full resource to the client and those resources should follow a uniform pattern throughout the API. I will go into more detail on what a resource is later in this article.

2. **Client-Server Relationship**: APIs following the RESTful design pattern strive to separate the concerns of data storage from the client, whether that client is a frontend user interface or another service.

3. **Stateless**: A RESTful API does not store the client’s state. It is up to the client to provide information necessary to the server to fulfill their request, including tokens, headers, etc. It is the client’s responsibility to manage session state.

4. **Start From Null**: During the design process of a RESTful API, the architect should start from the need of the whole system, without applying constraints and without boundaries to its components. Then, the architect should gradually apply constraints to the elements of the system, differentiating its parts.

5. **Catchability**: The system should be able to provide a cacheable resource state to the client when applicable and should explicitly tell the client whether it’s cacheable. This does not mean that the cache is necessarily server side, but that the client is able to identify whether the request response can be cached.

6. **Layered System**: The client of a RESTful API should only be able to have knowledge of the system it is interacting with. Content provided from systems upstream should be received as if the API was their true source.

7. **Code On Demand**: RESTful APIs can provide executable code to the client for use within the client. This is by no means a requirement, but it is allowed.

A crucial concept to understand when working with REST is the resource. A resource is the main representation of data, whole business domain object, and should be self-descriptive. For example, in “www.awebsite.com/api/blog”, “blog” is the resource and one can easily tell that “blog” is the endpoint to access blog articles. If I want to retrieve a collection of every available blog resource, then I would make a GET request to the endpoint (/api/blog). Let’s say I wanted to create a new blog resource. In that case, I would send a POST request to the same endpoint with all of the necessary information to make a blog and it would then send back that blog’s id, which we will say is the number 1. If I want to retrieve only the blog resource that I just create, then I would provide a URI parameter of blog’s id (/api/blog/1). These resources will have a defined media type, which the client will provide to the API. It’s a good practice to have only one media type per resource.

### “Hold up.. GET, POST… maybe you know about those, but I don’t”

Never fear, this is how HTTP and REST intersect. GET and POST are examples of resource methods. The most commonly used methods are:

- **GET**: to retrieve
- **POST**: to create
- **PUT**: to replace or create if does not exist
- **PATCH**: to update

Not every resource endpoint needs all of these. You may have scenarios when you only need a GET method or a POST method. However, the reason these are so common is because they can be used as an abstraction of CRUD (Create, Retrieve, Update, Delete) within a database. It’s important to note that these methods are simply tags for the request and the underlying logic in your service determines what a request does. Because of this, its important that your RESTful API uses the correct method for each action.

A few more concepts should be covered before a fuller understanding of REST can be achieved. The first of which is the concept an Aggregation Root. Let’s say my blog resources reference content resources. To keep it simple, lets have content contain a paragraph, a blog reference, and it’s position within that blog. Does it make sense for one paragraph to be accessed without the blog and it’s other paragraphs? Probably not. You wouldn’t have the context of the other content within the blog. In this case, the client should only be able to access either the blog without content (say with only its id, title, and publish date) or the blog with its content. So, /api/blog/1 might return the blog without content and /api/blog/1/view might return the aggregation of the blog and its content, though you could also have /api/blog/1 return the later. You should not, however, have an /api/content endpoint or an /api/blog/1/content/1 endpoint, because those do not make domain sense.

The last concept that I will cover in this article is that of the Query Parameter and when it should be used. Query parameters are appropriate when you want to sort or filter a resource. It should not be used to provide a modified resource or perform an action.

For example, /api/blog?publishedAfter=2022-1-1 could be used to provide only the blogs published after the first day in 2022, but you should not use /api/blog/1?foo=true to set a foo value in the blog resource to true or run a foo function within the API service. That should be done either within the body of a PATCH or PUT on the /api/blog/1 endpoint if you are updating a value or by adding a new URI parameter to the endpoint (/api/blog/1/foo) to execute a function.

I hope that you found this article to be a helpful RESTful API resource, no pun intended. It’s by no means an exhaustive reference on RESTful APIs, but I do hope it provided some additional clarification on the subject, if you weren’t an expert already.

#### References:
- [https://restfulapi.net/](https://restfulapi.net/)
- [https://www.ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm](https://www.ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm)