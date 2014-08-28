describe('Clarify function', function () {
  
  var o = require('../lib/clarify');
  var query, expected;
  var query2, expected2;
  
  beforeEach(function () {
    query = [
      [
        {rel: 'state', kvf: [{k: 'population', f: ['max']}]},
        {rel: 'state', kvf: [{k: 'area', f: ['max']}]}
      ]
    ];
    expected = ['state by population', 'state by area'];
    query2 = [
      [
        {rel: 'state', kvf: [{k: 'population', f: ['max']}]},
        {rel: 'state', kvf: [{k: 'area', f: ['max']}]}
      ],
      [
        {rel: 'border', kvf: [{k: 'border'}]}
      ],
      [
        {rel: 'city', kvf: [{k: 'city', v: 'washington'}]},
        {rel: 'state', kvf: [{k: 'state', v: 'washington'}]}
      ]
    ];
    expected2 = [['state by population', 'state by area'], null, ['city', 'state']];
  });
  
  describe('clarify function', function () {
  
    var clarify;
  
    beforeEach(function () {
      clarify = o.clarify;
    });
  
    it('should return short human-readable description of every generated stream', function () {    
      expect(clarify(query)).toEqual([expected]);
      
      query[0].push({rel: 'city', kvf: [{k: 'population', f: ['max']}]});
      query[0].push({rel: 'capital', kvf: [{k: 'population', f: ['max']}]});
      expected.push('city');
      expected.push('capital');
      expect(clarify(query)).toEqual([expected]);
    });
    
    it('will place human-readable representation at the same index in 2d array as original sub-query', function () {
      expect(clarify(query2)).toEqual(expected2);
    });
    
    it('returns empty array if passed query is also empty', function () {
      expect(clarify([])).toEqual([]);
      expect(clarify([[],[]])).toEqual([]);
    });
    
  });
  
  describe('clarifyRow function', function () {
  
    var clarifyRow;
  
    beforeEach(function () {
      clarifyRow = o.clarifyRow;
    });
  
    it('should create description of subqueries in a row', function () {    
      expect(clarifyRow(query[0])).toEqual(expected);
    });    
    
  });
  
  describe('relDiff function', function () {
  
    var relDiff;
  
    beforeEach(function () {
      relDiff = o.relDiff;
    });
  
    it('should return difference between relations', function () {    
      expect(relDiff(query[0][0], query[0][1])).toEqual([{by: 'population'}]);
      expect(relDiff(query[0][0], query[0][0])).toEqual(null);      
    });    
    
  });
  
  describe('kvfDiff function', function () {
  
    var kvfDiff;
  
    beforeEach(function () {
      kvfDiff = o.kvfDiff;
    });
  
    it('should return representation of differnce first passed kvf from second one', function () {    
      expect(kvfDiff(query[0][0].kvf, query[0][1].kvf)).toEqual([{by: 'population'}]);      
      expect(kvfDiff(query2[2][0].kvf, query2[2][1].kvf)).toEqual([{by: 'city'}]);
      expect(kvfDiff(
        [{k: 'population'}, {k: 'state', v: 'new york'}],
        [{k: 'state', v: 'washington'}, {k: 'population'}]
      )).toEqual([{by: 'state', pre: 'new york'}]);
      expect(kvfDiff(
        [{k: 'population', f: ['max']}],
        [{k: 'population'}]
      )).toEqual([{by: 'population', byMod: 'max'}]);
    });    
    
  });
  
  describe('merge function', function () {
  
    var merge;
  
    beforeEach(function () {
      merge = o.merge;
    });
  
    it('should return eventual differentiation of current sub-query', function () {    
      var data = [
        {pre: undefined, by: 'population', byMod: 'max'},
        {pre: 'washington', by: 'state', byMod: undefined},
        {pre: undefined, by: 'population', byMod: 'max'}
      ];
      expect(merge(data)).toEqual({pre: [undefined, 'washington'], by: ['population', 'state'], byMod: ['max', undefined]});
    });    
    
  });
  
  describe('extend function', function () {
  
    var extend;
  
    beforeEach(function () {
      extend = o.extend;
    });
  
    it('should extend passed string with passed description', function () {    
      var str = 'state';
      var desc = {
        pre: ['washington', 'new york'],
        by: ['population', 'area'],
        byMod: ['max', 'min']
      };
      expect(extend(str, desc)).toBe('washington, new york state by max population, min area');
    });
    
  });
  
});