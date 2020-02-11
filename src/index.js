/* global jQuery */

// plugin styles
import 'styles/main.scss';

/* eslint-disable func-names */
(function ($) {
  const defaults = {
    maxItems: Infinity,
    minItems: 0,
    selectionText: 'item',
    textPlural: 'items',
    moreThenFiveText: 'items',
    controls: {
      position: 'right',
      displayCls: 'iqdropdown-content',
      controlsCls: 'iqdropdown-item-controls',
      counterCls: 'counter',
      controlBtnsCls: "iqdropdown-menu-control-buttons",
      clearBtn: false,
      clearBtnLabel: "Clear",
      applyBtn: false,
      applyBtnLabel: "Apply"
    },
    items: {},
    setCustomMessage: (itemCount, totalItems) => {
      if (totalItems == 0) {
        return this.initialText
      }

      if (totalItems == 1) {
        return `1 ${this.selectionText}`
      }

      if (totalItems < 5) {
        return `${totalItems} ${this.textPlural}`
      }

      if (totalItems >= 5) {
        return `${totalItems} ${this.moreThenFiveText}`
      }
    },
    onChange: () => {},
    beforeDecrement: () => true,
    beforeIncrement: () => true,
  };

  $.fn.iqDropdown = function (options) {
    this.each(function () {
      const $this = $(this);
      const $selection = $this.find('p.iqdropdown-selection').last();
      const $menu = $this.find('div.iqdropdown-menu');
      const $items = $menu.find('div.iqdropdown-menu-option');
      const settings = $.extend(true, {}, defaults, options);
      const itemCount = {};
      let totalItems = 0;

      function updateDisplay () {
        return settings.setCustomMessage(itemCount, totalItems)
      }

      function setItemSettings (id, $item) {
        const minCount = Number($item.data('mincount'));
        const maxCount = Number($item.data('maxcount'));

        settings.items[id] = {
          minCount: Number.isNaN(Number(minCount)) ? 0 : minCount,
          maxCount: Number.isNaN(Number(maxCount)) ? Infinity : maxCount,
        };
      }

      function addControls (id, $item) {
        const $controls = $('<div />').addClass(settings.controls.controlsCls);
        const $decrementButton = $(`
          <button class="button-decrement">
            <i class="icon-decrement"></i>
          </button>
        `);
        const $incrementButton = $(`
          <button class="button-increment">
            <i class="icon-decrement icon-increment"></i>
          </button>
        `);
        const $counter = $(`<span>${itemCount[id]}</span>`).addClass(settings.controls.counterCls);

        $item.children('div').addClass(settings.controls.displayCls);
        $controls.append($decrementButton, $counter, $incrementButton);

        if (settings.controls.position === 'right') {
          $item.append($controls);
        } else {
          $item.prepend($controls);
        }

        $decrementButton.click((event) => {
          const { items, minItems, beforeDecrement, onChange } = settings;
          const allowClick = beforeDecrement(id, itemCount);

          if (allowClick && totalItems > minItems && itemCount[id] > items[id].minCount) {
            itemCount[id] -= 1;
            totalItems -= 1;
            $counter.html(itemCount[id]);
            updateDisplay();
            onChange(id, itemCount[id], totalItems);
          }

          event.preventDefault();
        });

        $incrementButton.click((event) => {
          const { items, maxItems, beforeIncrement, onChange } = settings;
          const allowClick = beforeIncrement(id, itemCount);

          if (allowClick && totalItems < maxItems && itemCount[id] < items[id].maxCount) {
            itemCount[id] += 1;
            totalItems += 1;
            $counter.html(itemCount[id]);
            updateDisplay();
            onChange(id, itemCount[id], totalItems);
          }

          event.preventDefault();
        });

        $item.click(event => event.stopPropagation());

        return $item;
      }

      function addControlBtns () {
        const $controlsBtn = $('<div />').addClass(settings.controls.controlBtnsCls);

        let $clearBtn, $applyBtn;

        if (settings.controls.clearBtn) {
          $clearBtn = $(`<button class="button-clear">${settings.controls.clearBtnLabel}</button>`)
          $controlsBtn.append($clearBtn)

          $clearBtn.click( (event) => {
            itemCount = {};
            updateDisplay();
            onChange(id, itemCount[id], totalItems);

            event.preventDefault();
          })
        }

        if (settings.controls.applyBtn) {
          $applyBtn = $(`<button class="button-apply">${settings.controls.applyBtn}</button>`)
          $controlsBtn.append($applyBtn)

          $applyBtn.click( (event) => {
            updateDisplay();
            onChange(id, itemCount[id], totalItems);
            $this.toggleClass('menu-open');

            event.preventDefault()
          } )
        }

        $menu.append($controlsBtn);
        
      }

      $this.click(() => {
        $this.toggleClass('menu-open');
      });

      $items.each(function () {
        const $item = $(this);
        const id = $item.data('id');
        const defaultCount = Number($item.data('defaultcount') || '0');

        itemCount[id] = defaultCount;
        totalItems += defaultCount;
        setItemSettings(id, $item);
        addControls(id, $item);
        addControlBtns();
      });

      updateDisplay();
    });

    return this;
  };
}(jQuery));
