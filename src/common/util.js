export function getYMDHMS(timestamp) {
  let time = new Date(timestamp)
  let year = time.getFullYear()
  const month = (time.getMonth() + 1).toString().padStart(2, '0')
  const date = (time.getDate()).toString().padStart(2, '0')
  const hours = (time.getHours()).toString().padStart(2, '0')
  const minute = (time.getMinutes()).toString().padStart(2, '0')
  const second = (time.getSeconds()).toString().padStart(2, '0')

  return year + '-' + month + '-' + date + ' ' + hours + ':' + minute + ':' + second
}


//通过js的内置对象JSON来进行数组对象的深拷贝
export function deepClone2(obj) {
  var _obj = JSON.stringify(obj),
    objClone = JSON.parse(_obj);
  return objClone;
}

// 合并两个对象的方法
export function merger(...opts) {
  let res = {};
  let combine = (opt) => {
    for (let prop in opt) {
      if (opt.hasOwnProperty(prop)) {
        //下面是深拷贝与浅拷贝的区别，用到了递归的思想
        if (Object.prototype.toString.call(opt[prop]) === '[object Object]') {
          res[prop] = merger(res[prop], opt[prop]);
        } else {
          res[prop] = opt[prop];
        }
      }
    }
  }
  //扩张运算符将两个对象合并到一个数组里因此可以调用length方法
  for (let i = 0; i < opts.length; i++) {
    combine(opts[i]);
  }
  return res;
}