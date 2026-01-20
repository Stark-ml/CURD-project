const API = "https://jsonplaceholder.typicode.com/posts";

const postsDiv = document.getElementById("posts");
const form = document.getElementById("postForm");
const titleInput = document.getElementById("title");
const bodyInput = document.getElementById("body");

async function getPosts() {
  try {
    const res = await fetch(API);
    const posts = await res.json();

    posts.slice(0, 10).forEach((post) => {
      showPost(post);
    });
  } catch (err) {
    console.log("Error fetching posts", err);
  }
}

function showPost(post) {
  const div = document.createElement("div");
  div.setAttribute("data-id", post.id);
  div.style.border = "1px solid #ccc";
  div.style.padding = "10px";
  div.style.marginBottom = "10px";

  div.innerHTML = `
    <input class="edit-title" value="${post.title}" disabled />
    <br><br>
    <textarea class="edit-body" disabled>${post.body}</textarea>
    <br><br>
    <button class="edit-btn">Edit</button>
    <button class="save-btn" style="display:none">Save</button>
    <button class="delete-btn">Delete</button>
  `;

  const editBtn = div.querySelector(".edit-btn");
  const saveBtn = div.querySelector(".save-btn");
  const deleteBtn = div.querySelector(".delete-btn");
  const editTitle = div.querySelector(".edit-title");
  const editBody = div.querySelector(".edit-body");

  editBtn.onclick = () => {
    editTitle.disabled = false;
    editBody.disabled = false;
    editBtn.style.display = "none";
    saveBtn.style.display = "inline";
  };

  saveBtn.onclick = () => {
    updatePost(post.id, editTitle.value, editBody.value);
  };

  deleteBtn.onclick = () => {
    deletePost(post.id);
  };

  postsDiv.appendChild(div);
}

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const title = titleInput.value;
  const body = bodyInput.value;

  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, userId: 1 }),
    });

    const newPost = await res.json();
    showPost(newPost);
    form.reset();
  } catch (err) {
    console.log("Error creating post", err);
  }
});

async function updatePost(id, title, body) {
  try {
    await fetch(API + "/" + id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, title, body, userId: 1 }),
    });

    const postDiv = document.querySelector(`[data-id="${id}"]`);
    postDiv.querySelector(".edit-title").disabled = true;
    postDiv.querySelector(".edit-body").disabled = true;

    postDiv.querySelector(".edit-btn").style.display = "inline";
    postDiv.querySelector(".save-btn").style.display = "none";
  } catch (err) {
    console.log("Error updating post", err);
  }
}

async function deletePost(id) {
  try {
    await fetch(API + "/" + id, { method: "DELETE" });
    document.querySelector(`[data-id="${id}"]`).remove();
  } catch (err) {
    console.log("Error deleting post", err);
  }
}

getPosts();
