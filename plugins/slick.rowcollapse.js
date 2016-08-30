(function (factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('jquery'));
  } else {
    factory(jQuery);
  }
}(function ($) {
  // register namespace
  $.extend(true, window, {
    "Slick": {
      "Plugins": {
        "RowCollapse": RowCollapse
      }
    }
  });


  /***
   * A plugin to add custom buttons to column headers.
   *
   * USAGE:
   *
   * Add the plugin .js & .css files and register it with the grid.
   *
   * To specify a custom button in a column header, extend the column definition like so:
   *
   *   var columns = [
   *     {
   *       id: 'myColumn',
   *       name: 'My column',
   *
   *       // This is the relevant part
   *       header: {
   *          buttons: [
   *              {
   *                // button options
   *              },
   *              {
   *                // button options
   *              }
   *          ]
   *       }
   *     }
   *   ];
   *
   * Available button options:
   *    cssClass:     CSS class to add to the button.
   *    image:        Relative button image path.
   *    tooltip:      Button tooltip.
   *    showOnHover:  Only show the button on hover.
   *    handler:      Button click handler.
   *    command:      A command identifier to be passed to the onCommand event handlers.
   *
   * The plugin exposes the following events:
   *    onCommand:    Fired on button click for buttons with 'command' specified.
   *        Event args:
   *            grid:     Reference to the grid.
   *            column:   Column definition.
   *            command:  Button command identified.
   *            button:   Button options.  Note that you can change the button options in your
   *                      event handler, and the column header will be automatically updated to
   *                      reflect them.  This is useful if you want to implement something like a
   *                      toggle button.
   *
   *
   * @param options {Object} Options:
   *    buttonCssClass:   a CSS class to use for buttons (default 'slick-header-button')
   * @class Slick.Plugins.HeaderButtons
   * @constructor
   */
  function RowCollapse(options) {
    var _grid;
    var _self = this;
    var _handler = new Slick.EventHandler();
    var taskFormatter = {formatter: TaskNameFormatter};

    function implementRowCollapseFormatter(cols, taskFormatter, colName) {
      for (var i in cols) {
        if (cols[i].name == colName) {
          $.extend(true, cols[i], taskFormatter);
          break;
        }
        if (cols[i].columns) {
          implementRowCollapseFormatter(cols[i].columns, taskFormatter, colName);
        }
      }
    }

    function TaskNameFormatter(row, cell, value, columnDef, dataContext) {
      value = value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      var spacer = "<span style='display:inline-block;height:1px;width:" + (15 * dataContext["indent"]) + "px'></span>";
      var idx = dataView.getIdxById(dataContext.id);
      if (data[idx + 1] && data[idx + 1].indent > data[idx].indent) {
        if (dataContext._collapsed) {
          return spacer + " <span class='toggle expand'></span>&nbsp;" + value;
        } else {
          return spacer + " <span class='toggle collapse'></span>&nbsp;" + value;
        }
      } else {
        return spacer + " <span class='toggle'></span>&nbsp;" + value;
      }
    }

    function overrideSetFilter(setFilter) {

      return function (filter) {
        filter = function (item, args) {

          if (!filter(item, args)) {
            return false;
          }

          if (item.parent != null) {
            var parent = data[item.parent];

            while (parent) {
              if (parent._collapsed || (parent["percentComplete"] < percentCompleteThreshold) || (searchString != "" && parent["title"].indexOf(searchString) == -1)) {
                return false;
              }

              parent = data[parent.parent];
            }
          }

          return true;
        };

        return setFilter(filter);
      }
    }

    function init(grid) {
      var colName = options.column;
      implementRowCollapseFormatter(columns, taskFormatter, colName);
      grid.setColumns(columns);
      _grid = grid;
      _handler
        .subscribe(_grid.onClick, handleOnRowCollapseClick);
      dataView.setFilter = overrideSetFilter(dataView.setFilter);
    }

    function handleOnRowCollapseClick(e, args) {
      if ($(e.target).hasClass("toggle")) {
        var item = dataView.getItem(args.row);
        if (item) {
          if (!item._collapsed) {
            item._collapsed = true;
          } else {
            item._collapsed = false;
          }
          dataView.updateItem(item.id, item);
        }
        e.stopImmediatePropagation();
      }
    }

    function destroy() {
      _handler.unsubscribeAll();
    }

    $.extend(this, {
      "init": init,
      "destroy": destroy
    });
  }
}))
;
