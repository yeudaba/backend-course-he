// P07-E08: גישה בטוחה
const getCity = (user) => user?.address?.city ?? "לא ידוע";
const getFirstPhone = (user) => {
  const phones = user?.phones ?? [];
  return phones[0] ?? null;
};
const displayName = (user) => user?.nickname || user?.firstName || "אורח";

console.log(getCity({ address: {} }), getFirstPhone({ phones: [] }), displayName({ nickname: "", firstName: "דנה" }));

module.exports = { getCity, getFirstPhone, displayName };
