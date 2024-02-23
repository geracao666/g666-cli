import got from 'got'
import { API_URL } from '../config/index.js'

export default got.extend({
  prefixUrl: API_URL
})