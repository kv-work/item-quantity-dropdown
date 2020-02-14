/* eslint-disable no-restricted-syntax */
/* global jQuery */

// plugin styles
import 'styles/main.scss';

/* eslint-disable func-names */
(function ($) {
  const defaults = {
    maxItems: Infinity,
    minItems: 0,
    initialText: 'select item',
    selectionText: 'item',
    textPlural: 'items',
    moreThenFiveText: 'items',
    controls: {
      position: 'right',
      displayCls: 'iqdropdown-content',
      controlsCls: 'iqdropdown-item-controls',
      counterCls: 'counter',
      controlBtnsCls: 'iqdropdown-menu-control-buttons',
      clearBtn: true,
      clearBtnLabel: 'Clear',
      applyBtn: true,
      applyBtnLabel: 'Apply',
    },
    items: {},
    setCustomMessage (itemCount, totalItems) {
      if (totalItems === 0) {
        return this.initialText;
      }

      if (totalItems === 1) {
        return `1 ${this.selectionText}`;
      }

      if (totalItems < 5) {
        return `${totalItems} ${this.textPlural}`;
      }

      if (totalItems >= 5) {
        return `${totalItems} ${this.moreThenFiveText}`;
      }
      return this.initialText;
    },
    onChange: () => {},
    beforeDecrement: (id, itemCount) => {
      if (itemCount[id] > 0) return true;
      return false;
    },
    beforeIncrement: () => true,
    onApply: (itemCount, totalItems) => {
      console.log('==================');
      console.log(`Total Items: ${totalItems} including:`);
      console.log(itemCount);
      console.log('==================');
    },
  };

  $.fn.iqDropdown = function (options) {
    this.each(function () {
      const $this = $(this);
      const $selection = $this.find('p.iqdropdown-selection').last();
      const $menu = $this.find('div.iqdropdown-menu');
      const $items = $menu.find('div.iqdropdown-menu-option');
      const settings = $.extend(true, {}, defaults, options);
      const itemCount = {};
      const itemLabels = {};
      let totalItems = 0;
      let clearBtnVisible = settings.controls.clearBtn;

      const updateDisplay = () => {
        $selection.html(settings.setCustomMessage(itemCount, totalItems, itemLabels));
        const $clearBtn = $this.find('button.button-clear');

        if (totalItems === 0 && $clearBtn && clearBtnVisible) {
          clearBtnVisible = false;
          $clearBtn.addClass('button-invisible');
        }

        if (totalItems !== 0 && $clearBtn && !clearBtnVisible) {
          clearBtnVisible = true;
          $clearBtn.removeClass('button-invisible');
        }

        $items.each(function () {
          const $item = $(this);
          const id = $item.data('id');
          const $decrementButton = $item.find('.button-decrement');
          const $incrementButton = $item.find('.button-increment');

          if (itemCount[id] <= settings.items[id].minCount) {
            $decrementButton.addClass('button-decrement-disabled');
          } else {
            $decrementButton.removeClass('button-decrement-disabled');
          }

          if (itemCount[id] >= settings.items[id].maxCount) {
            $incrementButton.addClass('button-increment-disabled');
          } else {
            $incrementButton.removeClass('button-increment-disabled');
          }
        });
      };

      function addClearEvent () {
        $menu.trigger('clear');
      }

      function addClearEventHandler () {
        $menu.bind('clear', (event) => {
          const target = event.currentTarget;

          $(target).find('.counter').html('0');
        });
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
          const {
            items,
            minItems,
            beforeDecrement,
            onChange,
          } = settings;
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
          const {
            items,
            maxItems,
            beforeIncrement,
            onChange,
          } = settings;
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
        let $controlsBtn;

        if (settings.controls.clearBtn || settings.controls.applyBtn) {
          $controlsBtn = $('<div />').addClass(settings.controls.controlBtnsCls);
        }


        let $clearBtn;
        let $applyBtn;

        if (settings.controls.clearBtn) {
          $clearBtn = $(`<button class="button-clear">${settings.controls.clearBtnLabel}</button>`);
          if (totalItems === 0) $clearBtn.addClass('button-invisible');
          $controlsBtn.append($clearBtn);

          $clearBtn.click((event) => {
            const { onChange } = settings;

            for (const key in itemCount) {
              if ({}.hasOwnProperty.call(itemCount, key)) {
                totalItems -= itemCount[key];
                itemCount[key] = 0;
                onChange(key, itemCount[key], totalItems);

                if (totalItems === 0) {
                  updateDisplay();
                }
              }
            }

            const clearEvent = new CustomEvent('clear', { bubbles: true });
            event.target.dispatchEvent(clearEvent);

            event.stopPropagation();
          });
        }

        if (settings.controls.applyBtn) {
          $applyBtn = $(`<button class="button-apply">${settings.controls.applyBtnLabel}</button>`);
          $controlsBtn.append($applyBtn);

          $applyBtn.click((event) => {
            const { onApply } = settings;

            onApply(itemCount, totalItems);
            $this.toggleClass('menu-open');

            event.stopPropagation();
          });
        }

        $menu.append($controlsBtn);
      }

      $this.click(() => {
        $this.toggleClass('menu-open');
      });

      $items.each(function () {
        const $item = $(this);
        const id = $item.data('id');
        const label = $item.find('.iqdropdown-item')[0].innerText;
        const defaultCount = Number($item.data('defaultcount') || '0');

        itemCount[id] = defaultCount;
        itemLabels[id] = label;
        totalItems += defaultCount;
        setItemSettings(id, $item);
        addControls(id, $item);
      });
      addClearEvent();
      addClearEventHandler();
      addControlBtns();
      updateDisplay();
    });


    return this;
  };
}(jQuery));
