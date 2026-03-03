// utils/request.js
// 网络请求封装

const app = getApp();

// 不需要 Token 的白名单接口
const WHITE_LIST = [
  '/login/',
  '/register/',
  '/sendCode',
  '/resetPassword'
];

// 检查是否为白名单接口
function isWhiteList(url) {
  return WHITE_LIST.some(path => url.startsWith(path));
}

/**
 * 发起网络请求
 * @param {Object} options 请求配置
 * @param {string} options.url 请求路径（不含baseUrl）
 * @param {string} options.method 请求方法，默认 GET
 * @param {Object} options.data 请求数据
 * @param {Object} options.header 请求头
 * @returns {Promise} 返回 Promise
 */
const request = (options) => {
  return new Promise((resolve, reject) => {
    const { url, method = 'GET', data = {}, header = {} } = options;
    
    // 构建请求头
    const requestHeader = {
      'Content-Type': 'application/json',
      ...header
    };
    
    // 非白名单接口需要添加 Token
    if (!isWhiteList(url)) {
      const token = wx.getStorageSync('token');
      if (token) {
        requestHeader['JWTtoken'] = token;
      }
    }
    
    wx.request({
      url: `${app.globalData.baseUrl}${url}`,
      method,
      data,
      header: requestHeader,
      success: (res) => {
        // 处理 401 未授权，清除 token 并提示重新登录
        if (res.statusCode === 401) {
          wx.removeStorageSync('token');
          wx.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none'
          });
          reject(res);
          return;
        }
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject(res);
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

/**
 * GET 请求
 */
const get = (url, data = {}, header = {}) => {
  return request({ url, method: 'GET', data, header });
};

/**
 * POST 请求
 */
const post = (url, data = {}, header = {}) => {
  return request({ url, method: 'POST', data, header });
};

/**
 * PUT 请求
 */
const put = (url, data = {}, header = {}) => {
  return request({ url, method: 'PUT', data, header });
};

/**
 * DELETE 请求
 */
const del = (url, data = {}, header = {}) => {
  return request({ url, method: 'DELETE', data, header });
};

/**
 * 文件上传
 * @param {string} url 上传接口路径
 * @param {string} filePath 本地文件路径
 * @param {Object} formData 额外的表单数据
 * @param {string} name 文件对应的 key
 * @returns {Promise} 返回 Promise
 */
const uploadFile = (url, filePath, formData = {}, name = 'file') => {
  return new Promise((resolve, reject) => {
    const header = {};
    
    // 非白名单接口需要添加 Token
    if (!isWhiteList(url)) {
      const token = wx.getStorageSync('token');
      if (token) {
        header['JWTtoken'] = token;
      }
    }
    
    wx.uploadFile({
      url: `${app.globalData.baseUrl}${url}`,
      filePath,
      name,
      formData,
      header,
      success: (res) => {
        // 处理 401 未授权
        if (res.statusCode === 401) {
          wx.removeStorageSync('token');
          wx.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none'
          });
          reject(res);
          return;
        }
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // 解析返回的 JSON 字符串
          try {
            const data = JSON.parse(res.data);
            resolve(data);
          } catch (e) {
            resolve(res.data);
          }
        } else {
          reject(res);
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

module.exports = {
  request,
  get,
  post,
  put,
  del,
  uploadFile
};
