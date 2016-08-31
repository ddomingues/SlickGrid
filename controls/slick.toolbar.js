(function (factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('jquery'));
  } else {
    factory(jQuery);
  }
}(function ($) {
  var prevCommandQueue = [];
  var lateCommandQueue = [];

  function queueAndExecuteCommand(item, column, editCommand) {
    prevCommandQueue.push(editCommand);
    editCommand.execute();
  }

  function undo() {
    var command = prevCommandQueue.pop();
    if (command && Slick.GlobalEditorLock.cancelCurrentEdit()) {
      command.undo();
      lateCommandQueue.push(command);
      grid.gotoCell(command.row, command.cell, false);
    }
  }

  function redo() {
    var command = lateCommandQueue.pop();
    if (command && Slick.GlobalEditorLock.cancelCurrentEdit()) {
      command.execute();
      prevCommandQueue.push(command);
      grid.gotoCell(command.row, command.cell, false);
    }
  }

  function SlickGridToolbar(grid, $container) {
    var $status;

    function init() {
      grid.setOptions({editCommandHandler: queueAndExecuteCommand});
      constructToolbarUI();
    }

    function constructToolbarUI() {
      $container.empty();

      var $nav = $("<span class='slick-toolbar-nav' />").appendTo($container);
      $status = $("<span class='slick-toolbar-status' />").appendTo($container);

      $("<button title='Undo' onclick='ToolbarUndo();' class='slick-toolbar-icon-container'><img src='../images/arrow_undo.png' height='16' style='padding-bottom: 2px;'></button>")
        .appendTo($nav);

      $("<button title='Redo' onclick='ToolbarRedo();' class='slick-toolbar-icon-container'><img src='../images/arrow_redo.png' height='16' style='padding-bottom: 2px;'></button>")
        .appendTo($nav);

      $container.find(".slick-toolbar-icon-container")
        .hover(function () {
          $(this).toggleClass("slick-toolbar-icon-state-hover");
        });

      $container.children().wrapAll("<div class='slick-toolbar' />");
    }

    init();
  }

  // Slick.Controls.Toolbar
  $.extend(true, window, {Slick: {Controls: {Toolbar: SlickGridToolbar}}});

  $.extend(this, {
    "ToolbarUndo": undo,
    "ToolbarRedo": redo
  });
}));
