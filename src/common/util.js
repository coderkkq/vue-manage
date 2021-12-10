export function getYMDHMS (timestamp) {
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