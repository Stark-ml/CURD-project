const API = "https://jsonplaceholder.typicode.com/posts";

const postsDiv = document.getElementById("posts");
const form = document.getElementById("postForm");

const titleInput = document.getElementById("title");
const bodyInput = document.getElementById("body");
const imageInput = document.getElementById("image");

function getLocalPosts() {
  return JSON.parse(localStorage.getItem("posts")) || [];
}

function saveLocalPosts(posts) {
  localStorage.setItem("posts", JSON.stringify(posts));
}


async function getPosts() {
  const localPosts = getLocalPosts();
  localPosts.forEach(post => {
    showPost(post, post.imageURL || null);
  });

  const res = await fetch(API);
  const posts = await res.json();

  posts.slice(0, 10).forEach(post => {
    showPost(post, null);
  });
}

function showPost(post, imageURL = null) {
  const div = document.createElement("div");
  div.className = "card";
  div.setAttribute("data-id", post.id);

  div.innerHTML = `
    ${imageURL ? `<img src="${imageURL}" class="post-img">` : ""}

    <div class="post-content">
      <input class="edit-title" value="${post.title}" disabled>
      <textarea class="edit-body" disabled>${post.body}</textarea>

      <div class="actions">
        <button class="edit">Edit</button>
        <button class="save" style="display:none">Save</button>
        <button class="delete">Delete</button>
      </div>
    </div>
  `;

  const editBtn = div.querySelector(".edit");
  const saveBtn = div.querySelector(".save");
  const deleteBtn = div.querySelector(".delete");

  const titleField = div.querySelector(".edit-title");
  const bodyField = div.querySelector(".edit-body");

  editBtn.onclick = () => {
    titleField.disabled = false;
    bodyField.disabled = false;
    editBtn.style.display = "none";
    saveBtn.style.display = "block";
  };

  saveBtn.onclick = () => {
    updatePost(post.id, titleField.value, bodyField.value);
    titleField.disabled = true;
    bodyField.disabled = true;
    editBtn.style.display = "block";
    saveBtn.style.display = "none";
  };

  deleteBtn.onclick = () => {
    deletePost(post.id);
  };

  postsDiv.prepend(div);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();
  const imageFile = imageInput.files[0];

  if (!title || !body) return;

  const imageURL = imageFile ? URL.createObjectURL(imageFile) : null;

  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, body, userId: 1 }),
  });

  const newPost = await res.json();

  newPost.id = Date.now();
  newPost.imageURL = imageURL;

  const posts = getLocalPosts();
  posts.unshift(newPost);
  saveLocalPosts(posts);

  showPost(newPost, imageURL);
  form.reset();
});

async function updatePost(id, title, body) {
  await fetch(API + "/" + id, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, title, body, userId: 1 }),
  });

  const posts = getLocalPosts();
  const index = posts.findIndex(p => p.id === id);

  if (index !== -1) {
    posts[index].title = title;
    posts[index].body = body;
    saveLocalPosts(posts);
  }
}

async function deletePost(id) {
  await fetch(API + "/" + id, { method: "DELETE" });

  let posts = getLocalPosts();
  posts = posts.filter(post => post.id !== id);
  saveLocalPosts(posts);

  document.querySelector(`[data-id="${id}"]`)?.remove();
}
getPosts();