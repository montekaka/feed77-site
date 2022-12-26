import axios from "axios"

export const request = async (url) => {
  const res = await axios.get(url)
  return res.data;
}
