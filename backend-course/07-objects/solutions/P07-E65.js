function moveCity(user, city) {
  return { ...user, address: { ...user.address, city } };
}

function addTag(user, tag) {
  if (user.tags.includes(tag)) {
    return user;
  }
  return { ...user, tags: [...user.tags, tag] };
}

const user = { name: "דנה", address: { city: "חיפה", zip: "3100" }, tags: ["vip"] };
console.log(moveCity(user, "אילת"), addTag(user, "new"), user);

module.exports = { moveCity, addTag };
