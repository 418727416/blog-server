const db = require('../../models/db.js');
const Hutils = require('../../utils/utils.js');
const formatDateTime = Hutils.formatDateTime;
const resMsg = Hutils.resMsg;
/**
 * 文章查询
 * /api/articals/search
 * {
 *   code:"",    状态码
 *   message:"", 状态信息  
 *   page:{},    分页信息
 *   data:[]     单页数据
 * }
 */
exports.search = function(req, res, next) {
    var currentPage = parseInt(req.body.page.currentPage) || 1;
    var pageSize = parseInt(req.body.page.pageSize);
    //  找到所有文章 按时间倒序
    var query = db.getConnection('schemaArticals').find({}).sort({ '_id': -1 });
    var pageTotal = 0;
    var pages = 0;
    db.count('schemaArticals', {}, function(err, count) {
      pageTotal = count;
      pages = Math.ceil(pageTotal / pageSize);
    })
    query.skip((currentPage - 1) * pageSize);
    query.limit(pageSize);
    query.exec(function(err, items) {
      if (err) return next(err);
      var page = {
        pageTotal: pageTotal,
        pages: pages,
        currentPage: currentPage,
        pageSize: pageSize
      }
      var data = resMsg("00", "文章加载成功", items, page);
      res.json(data);
    })
  }
  /**
   * 文章添加
   * /api/articals/add
   * {
   *   title,    标题
   *   content,  内容
   *   type      类型
   * } 
   * {
   *   code:"",    状态码
   *   message:"", 状态信息  
   *   data:[]     单页数据
   * }
   */
exports.add = function(req, res, next) {
  if (req.session.user) {
    if (req.session.user.action != 1) {
      var data = resMsg('11', '权限不足')
      res.json(data);
      return false;
    }
    var title = req.body.title;
    var content = req.body.content;
    var type = req.body.type;
    var date = formatDateTime(new Date());
    db.save('schemaArticals', {
      title: title,
      content: content,
      type: type,
      zan: 0,
      view: 0,
      date: date
    }, function(err) {
      if (err) return next(err);
      var data = resMsg('00', '文章添加成功')
      res.json(data);
    })
  } else {
    var data = resMsg('11', '请先登陆')
    res.json(data);
  }
}