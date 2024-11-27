const request = require("supertest");
const app = require("../index");

describe("API Testings", () => {
  //tesing the test route '/test'
  it("GET /test | Response with valid text Hello", async () => {
    const response = await request(app).get("/test");
    expect(response.statusCode).toBe(200);
    expect(response.text).toEqual("Hello");
  });

  // testing get all blogs route '/api/blog/get-blogs'
  it("GET /api/blog/get-blogs | Response with valid json", async () => {
    const response = await request(app).get("/api/blog/get-blogs");
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeDefined();
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Blogs fetched successfully");
  });

  // testing user registration route '/api/user/create'
  it("POST /api/user/create | Response with valid json", async () => {
    const response = await request(app).post("/api/user/create").send({
      firstName: "test",
      lastName: "test",
      email: "test123@cmail.com",
      password: "test123",
    });
    console.log(response.body);
    if (response.body.success) {
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("User created successfully.");
    } else {
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("User already exists.");
    }
  });

  //Task : write test for login route
  //It will pass when user is already registered
  // Testing user login route '/api/user/login'
  it("POST /api/user/login | Response with valid json data", async () => {
    // Assuming you have a registered user for testing, you can use the credentials below
    const loginCredentials = {
      email: "admin@email.com",
      password: "admin123",
    };

    const response = await request(app)
      .post("/api/user/login")
      .send(loginCredentials);

    // Assuming successful login
    if (response.body.success) {
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toEqual("User logged in successfully.");
    } else {
      // Assuming unsuccessful login (invalid credentials)
      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toEqual("Password does not match.");

      // Add more expectations based on your implementation
    }
  });

  // Testing get all users route '/api/user/users'
  it("GET /api/user/users | Response with valid json", async () => {
    const response = await request(app).get("/api/user/users");
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeDefined();
    expect(Array.isArray(response.body)).toBe(true);
  });
  // Testing get single blog route '/api/blog/get-single-blog/:blogId'
  it("GET /api/blog/get-single-blog/:blogId | Response with valid json", async () => {
    // Assuming you have a blog ID for testing, you can replace "123abc" with a valid blog ID
    const blogId = "65db217b6c49234469be6da9";
    const response = await request(app).get(
      `/api/blog/get-single-blog/${blogId}`
    );
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeDefined();
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Blog fetched successfully");
    expect(response.body.blog).toBeDefined();
  });
  // Testing pagination route '/api/blog/get_pagination'
  it("GET /api/blog/get_pagination | Response with valid json", async () => {
    // Assuming you want to fetch the first page
    const page = 1;
    const response = await request(app).get(
      `/api/blog/get_pagination?page=${page}`
    );
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeDefined();
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.blogs)).toBe(true);
  });
  // Testing search blog by title route '/api/blog/search-blog'
  it("GET /api/blog/search-blog | Response with valid json", async () => {
    // Assuming you want to search for blogs with a specific title
    const title = "title"; // Update with the title you want to search for
    const response = await request(app).get(
      `/api/blog/search-blog?title=${title}`
    );
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeDefined();
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.blogs)).toBe(true);
  });
  // Testing request code route '/api/user/request-code'
  it("POST /api/user/request-code | Response with valid json", async () => {
    // Assuming you want to request code for a registered user
    const email = "lilpony1100@gmail.com"; // Update with a valid email
    const response = await request(app)
      .post("/api/user/request-code")
      .send({ email });
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeDefined();
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Verification code sent to your email.");
  });
});
