module.exports = (function () {

  function clarify(query) {
    var res = [];
    var i = query.length;
    for (; i--;) {
      if (query[i].length > 1) {
        res.unshift(clarifyRow(query[i]));
      } else {
        res.unshift(null);
      }
    }
    return res.every(function (e) {return e === null;}) ? [] : res;
  };

  function clarifyRow (ambiguous) {
    var t = ambiguous.map(function (e) {return e.rel;});
    var diff = [];
    for (var i in ambiguous) {
      diff[i] = [];
      for (var j in ambiguous) {
        if (i !== j) {
          var rdif = relDiff(ambiguous[i], ambiguous[j]);
          rdif && diff[i].push(rdif);
        }
      }
      diff[i] = merge(diff[i]);
      t[i] = extend(t[i], diff[i]);
    }
    return t;
  }

  function relDiff (rel1, rel2) {
    if (rel1.rel !== rel2.rel) {
      return null;
    } else {
      return kvfDiff(rel1.kvf, rel2.kvf);
    }  
  }

  function kvfDiff (kvf1, kvf2) {
    var d = [];
    for (var k1 in kvf1) {
      var candidate = {
        pre: kvf1[k1].v,
        by: kvf1[k1].k,
        byMod: kvf1[k1].f ? kvf1[k1].f.join(', ') : undefined
      };
      var rank = 3;
      for (var k2 in kvf2) {
        if (kvf1[k1].k === kvf2[k2].k) {
          if (kvf1[k1].v === kvf2[k2].v) {
            if (JSON.stringify(kvf1[k1].f) === JSON.stringify(kvf2[k2].f)) {
              candidate = null;
              break;
            } else {
              if (rank > 0) {
                candidate.pre = undefined;
                rank = 0;
              }
            }
          } else {
            if (JSON.stringify(kvf1[k1].f) === JSON.stringify(kvf2[k2].f)) {
              if (rank > 0) {
                candidate.byMod = undefined;
                rank = 0;
              }
            }
          }
        } else {
          if (kvf1[k1].v === kvf2[k2].v) {
            if (JSON.stringify(kvf1[k1].f) === JSON.stringify(kvf2[k2].f)) {
              if (rank > 1) {
                candidate.pre = undefined;
                candidate.byMod = undefined;
                rank = 1;
              }
            } else {
              if (rank > 2) {
                candidate.pre = undefined;
                rank = 2;
              }
            }
          } else {
            if (JSON.stringify(kvf1[k1].f) === JSON.stringify(kvf2[k2].f)) {
              if (rank > 2) {
                candidate.byMod = undefined;
                rank = 2;
              }
            }
          }
        }
      }
      d.push(candidate);
    }
    if (d.every(function (e) { return e === null; })) {
      return null;
    } else {
      return d.filter(function (e) { return e; });
    }
  }

  function merge (difs) {
    var res = {
      pre: [],
      by: [],
      byMod: []
    };
    var flatten = Array.prototype.concat.apply([], difs);    
    var z = [];
    for (var i in flatten) {
      var toCheck = flatten[i].pre + flatten[i].by + flatten[i].byMod;
      if (z.indexOf(toCheck) === -1) {
        z.push(toCheck);
        res.pre.push(flatten[i].pre);
        res.by.push(flatten[i].by);
        res.byMod.push(flatten[i].byMod);
      }
    }
    return res;
  }

  function extend (what, ext) {
    var by;
    if (ext.by.length) {
      by = ' by ';
      by += ( ( ext.byMod[0] ) ? ( ext.byMod[0] + ' ' ) : ( '' ) ) + ext.by[0];
      for (var i = 1; i < ext.by.length; i++) {
        by += ', ' + ( ( ext.byMod[i] ) ? ( ext.byMod[i] + ' ' ) : ( '' ) ) + ext.by[i];
      }
    } else {
      by = '';
    }
    var pre = ext.pre.join(', ');
    if (pre.length) {
      pre += ' ';
    } else {
      pre = '';
    }
    return pre + what + by;
  }
  
  return {
    clarify: clarify,
    clarifyRow: clarifyRow,
    relDiff: relDiff,
    kvfDiff: kvfDiff,
    merge: merge,
    extend: extend
  };
  
})();