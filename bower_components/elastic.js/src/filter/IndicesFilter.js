  /**
    @class
    <p>The indices filter can be used when executed across multiple indices, 
    allowing to have a filter that executes only when executed on an index that 
    matches a specific list of indices, and another filter that executes when it 
    is executed on an index that does not match the listed indices.</p>

    @name ejs.IndicesFilter
    @ejs filter
    @borrows ejs.FilterMixin.name as name
    @borrows ejs.FilterMixin.cache as cache
    @borrows ejs.FilterMixin.cacheKey as cacheKey
    @borrows ejs.FilterMixin._type as _type
    @borrows ejs.FilterMixin.toJSON as toJSON

    @desc
    A configurable filter that is dependent on the index name.

    @param {Object} fltr A valid filter object.
    @param {(String|String[])} indices a single index name or an array of index 
      names.
    */
  ejs.IndicesFilter = function (fltr, indices) {

    if (!isFilter(fltr)) {
      throw new TypeError('Argument must be a Filter');
    }
  
    var 
      _common = ejs.FilterMixin('indices'),
      filter = _common.toJSON();
    
    filter.indices.filter = fltr.toJSON();

    if (isString(indices)) {
      filter.indices.indices = [indices];
    } else if (isArray(indices)) {
      filter.indices.indices = indices;
    } else {
      throw new TypeError('Argument must be a string or array');
    }

    return extend(_common, {

      /**
            Sets the indicies the filter should match.  When passed a string,
            the index name is added to the current list of indices.  When passed
            an array, it overwites all current indices.

            @member ejs.IndicesFilter
            @param {(String|String[])} i A single index name or an array of index names.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      indices: function (i) {
        if (i == null) {
          return filter.indices.indices;
        }

        if (isString(i)) {
          filter.indices.indices.push(i);
        } else if (isArray(i)) {
          filter.indices.indices = i;
        } else {
          throw new TypeError('Argument must be a string or array');
        }

        return this;
      },
  
      /**
            Sets the filter to be used when executing on one of the indicies 
            specified.

            @member ejs.IndicesFilter
            @param {Object} f A valid Filter object
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      filter: function (f) {
        if (f == null) {
          return filter.indices.filter;
        }

        if (!isFilter(f)) {
          throw new TypeError('Argument must be a Filter');
        }
      
        filter.indices.filter = f.toJSON();
        return this;
      },

      /**
            Sets the filter to be used on an index that does not match an index
            name in the indices list.  Can also be set to "none" to not match any
            documents or "all" to match all documents.

            @member ejs.IndicesFilter
            @param {(Filter|String)} f A valid Filter object or "none" or "all"
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      noMatchFilter: function (f) {
        if (f == null) {
          return filter.indices.no_match_filter;
        }

        if (isString(f)) {
          f = f.toLowerCase();
          if (f === 'none' || f === 'all') {
            filter.indices.no_match_filter = f;
          }
        } else if (isFilter(f)) {
          filter.indices.no_match_filter = f.toJSON();
        } else {
          throw new TypeError('Argument must be string or Filter');
        }
    
        return this;
      }
      
    });
  };
