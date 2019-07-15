/*
 * "This work is created by NimbusWeb and is copyrighted by NimbusWeb. (c) 2017 NimbusWeb.
 * You may not replicate, copy, distribute, or otherwise create derivative works of the copyrighted
 * material without prior written permission from NimbusWeb.
 *
 * Certain parts of this work contain code licensed under the MIT License.
 * https://www.webrtc-experiment.com/licence/ THE SOFTWARE IS PROVIDED "AS IS",
 * WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * */

var cropper = null;
window.cropper_data = {};

$(document).on('ready_redactor', function () {
    if (localStorage.enableNumbers === 'true') {
        $('#nsc_redactor_numbers option').attr('selected', false).prop("selected", false).filter('[value="numbers"]').attr('selected', 'selected').prop("selected", true)
    }
    let tooltipSetting = {
        hide: false,
        position: {my: "left+2 center", at: "right center"}
    };
    let $panel_button = $('.nsc-panel-button');
    $panel_button
        .tooltip(tooltipSetting)
        .on('click', function (e) {
            $('#nsc_crop').remove();
            cropper && cropper.destroy();

            if ($(this).hasClass('not_change_active')) {
                $panel_button.filter(this).toggleClass('active');
            } else if (!$(this).find('select').length) {
                $panel_button.not('.change').removeClass('active').filter(this).addClass('active');
                if (localStorage.enableNumbers === 'true') {
                    $('#nsc_redactor_numbers').closest('.nsc-panel-button').addClass('active')
                }
            } else {
                if ($(e.target).hasClass('.nsc-panel-text') || $(e.target).closest('.nsc-panel-text').length) {
                    let $targetButton = ($(e.target).closest('.nsc-panel-select').length ? $(e.target).closest('.nsc-panel-select') : $(e.target)).closest('.nsc-panel-button');
                    let $option = $targetButton.find('select option:selected');
                    $targetButton.find('li').removeClass('active').filter('[data-value=\'' + $option.val() + '\']').addClass('active').trigger('click');
                }
            }
        })
        .contextmenu(function (e) {
            if ($(e.currentTarget).hasClass('tools') && confirm('Set this tool as your default instrument?')) {
                let id = $(e.currentTarget).find('option:selected').data('toolId');
                if ($(e.target).closest('.nsc-panel-dropdown-icon').length) {
                    id = $(e.target).closest('.nsc-panel-dropdown-icon').data('toolId');
                }
                localStorage.defaultTool = id;
                window.core.setOption('defaultTool', localStorage.defaultTool);
                $(document).trigger('redactor_set_tools', localStorage.defaultTool);
            }
            return false;
        })
        .find('select')
        .each(function () {
            let select = this;
            let select_id = $(select).data('id');
            $(select)
                .on('change_js', function (e) {
                    if (localStorage[select_id]) {
                        $(this).find('option').attr('selected', false).prop("selected", false).filter('[value="' + localStorage[select_id] + '"]').attr('selected', 'selected').prop("selected", true);
                    }

                    let $option_selected = $(this).find('option:selected');
                    let $panel_text = $(this).closest('.nsc-panel-button').find('.nsc-panel-text');
                    $panel_text.attr('title', $option_selected.attr('title')).tooltip(tooltipSetting);

                    if ($panel_text.find('.nsc-panel-text-font').length) {
                        $panel_text.find('.nsc-panel-text-font').text($option_selected.text());
                    } else if ($panel_text.find('.nsc-panel-text-value').length) {
                        if ($option_selected.data('icon')) {
                            $panel_text.find('.nsc-panel-text-value').prev('span').remove().end().before($('<span>').addClass($option_selected.data('icon')))
                        }
                        $panel_text.find('.nsc-panel-text-value').text($option_selected.text());
                    } else {
                        $panel_text.find('span').attr('class', $option_selected.attr('class'));
                    }

                    // if ($option_selected.val() === 'number') {
                    //     localStorage.enableNumbers = false;
                    // }
                })
                .trigger('change_js')
                .hide()
                .after($('<ul>'))
                .find('option')
                .each(function (index, option) {
                    $(select)
                        .next('ul')
                        .append(
                            $('<li>')
                                .addClass($(select).attr('class'))
                                .attr('data-tool-id', $(option).data('toolId'))
                                .attr('title', $(option).data('i18n') ? chrome.i18n.getMessage($(option).data('i18n')) : '')
                                .attr('data-value', $(option).val())
                                .on('click_js', function () {
                                    localStorage[select_id] = $(this).data('value');

                                    $panel_button.not('.change').removeClass('active').find('li').removeClass('active');
                                    $(select).closest('.nsc-panel-button').addClass('active');
                                    $(this).addClass('active');
                                    $(select).find('option').attr('selected', false).prop("selected", false).filter('[value="' + $(this).data('value') + '"]').attr('selected', 'selected').prop("selected", true);
                                    $(option).closest('.nsc-panel-dropdown').hide().trigger('hide');
                                    $(select).trigger('change_js');

                                    if (localStorage.enableNumbers === 'true') {
                                        $('#nsc_redactor_numbers').closest('.nsc-panel-button').addClass('active')
                                    }
                                })
                                .on('click', function () {
                                    $(this).trigger('click_js');
                                    $(select).trigger('change');
                                })
                                .tooltip(tooltipSetting)
                                .append(function () {
                                        let dom = [];
                                        if ($(option).data('icon')) {
                                            dom.push($('<span>').addClass($(option).data('icon')))
                                        }
                                        dom.push($('<span>').addClass($(option).attr('class')).text($(option).text()));
                                        return dom;
                                    }
                                )
                        )
                })
        });

    $(document).on('click', function (e) {
        let $target_dropdown = $(e.target).closest('.nsc-panel-dropdown');
        if (($(e.target).closest('.nsc-panel-trigger').length && $(e.target).closest('.nsc-panel-select').length)
            || ($(e.target).closest('.nsc-panel-text').length && $(e.target).closest('.nsc-panel-button').hasClass('assembled'))) {
            let $target = $(e.target).closest('.nsc-panel-select').length ? $(e.target).closest('.nsc-panel-select') : $(e.target);
            $target_dropdown = $target.next('.nsc-panel-dropdown');
            if ($target_dropdown.is(':visible')) {
                $target_dropdown.hide().trigger('hide');
            } else {
                $target_dropdown.show().trigger('show');
            }
        }
        $('.nsc-panel-dropdown').not($target_dropdown).hide();
    });

    $(document).on('redactor_set_tools', function (e, tools) {
        $('[data-tool-id=' + tools + ']').trigger('click_js');
    });

    $('.nsc-panel-dropdown').on('show', function () {
        // $(this).closest('.nsc-panel-button').tooltip().tooltip("disable");
    });

    $('.nsc-panel-dropdown').on('hide', function () {
        // $('.nsc-panel-button').tooltip().tooltip("enable");
    });

    $("#zoom_out").click(function () {
        var z = nimbus_screen.canvasManager.getZoom();
        if (z > 0.25) z -= 0.25;
        $("#nsc_zoom_percent").val(z).trigger('change').trigger('change_js');
    });

    $("#zoom_in").click(function () {
        let z = nimbus_screen.canvasManager.getZoom();
        if (z < 2) z += 0.25;
        $("#nsc_zoom_percent").val(z).trigger('change').trigger('change_js');
    });

    $('#nsc_zoom_percent').on('change', function () {
        nimbus_screen.canvasManager.zoom(+this.value);
        return false;
    });

    var $resize_form = $("#nsc_redactor_resize_form");
    var $resize_img_width = $("#nsc_redactor_resize_img_width");
    var $resize_img_height = $("#nsc_redactor_resize_img_height");
    var $resize_proportional = $("#nsc_redactor_resize_proportional");

    const size = nimbus_screen.getEditCanvasSize();
    $resize_img_width.val(size.w);
    $resize_img_height.val(size.h);

    $resize_img_width.on('input', function () {
        if ($resize_proportional.prop('checked')) {
            const size = nimbus_screen.getEditCanvasSize();
            $resize_img_height.val(Math.round(this.value * size.h / size.w));
        }
    });

    $resize_img_height.on('input', function () {
        if ($resize_proportional.prop('checked')) {
            const size = nimbus_screen.getEditCanvasSize();
            $resize_img_width.val(Math.round(this.value * size.w / size.h));
        }
    });

    $resize_proportional.on('change', function () {
        if (this.checked) {
            const firstSize = nimbus_screen.getEditCanvasSize();
            $resize_img_width.val(firstSize.fW);
            $resize_img_height.val(firstSize.fH);
        }
    });

    $resize_form.on('submit', function () {
        nimbus_screen.canvasManager.changeSize(this.width.value, this.height.value);
        return false;
    });

    $resize_form.find('button').on('click', function () {
        $resize_form.closest('.nsc-panel-dropdown').hide().trigger('hide');
    });

    $("#nsc_redactor_crop").on('click', function () {
        const size = nimbus_screen.getEditCanvasSize();
        const zoom = nimbus_screen.canvasManager.getZoom();
        const position = $('#nsc_canvas').offset();

        let pole = $('<div id="nsc_crop">').css({
            width: size.w * zoom,
            height: size.h * zoom,
            position: 'absolute',
            left: position.left + 'px',
            top: '0',
            zIndex: 999999999,
        });

        let fon = nimbus_screen.canvasManager.getCanvas().fon.canvas;
        let bg = nimbus_screen.canvasManager.getCanvas().background.canvas;

        let canvas = document.createElement('canvas');
        canvas.width = fon.width;
        canvas.height = fon.height;
        canvas.getContext('2d').drawImage(fon, 0, 0);
        canvas.getContext('2d').drawImage(bg, 0, 0);

        pole.append($('<img/>', {id: 'nsc_crop_image', src: canvas.toDataURL(), width: size.w * zoom, height: size.h * zoom}));

        pole.bind({
            'mousemove': function (e) {
                if (e.which === 3) {
                    $('#nsc_crop').remove();
                    cropper && cropper.destroy();
                    $("#nsc_redactor_crop").trigger('click');
                    return false;
                }
                nimbus_screen.canvasManager.scrollPage(e)
            },
            'contextmenu': function (e) {
                $('#nsc_crop').remove();
                cropper && cropper.destroy();
                $("#nsc_redactor_crop").trigger('click');
                return false;
            }
        });

        pole.prependTo('#nsc_canvas_scroll');

        const image = document.getElementById('nsc_crop_image');
        cropper = new Cropper(image, {
            autoCrop: false,
            zoomable: false,
            viewMode: 1,
            toggleDragModeOnDblclick: false,
            ready() {
                $('.cropper-bg').css('background-image', 'inherit')
            },
            cropstart: function () {
                let data = cropper.getData(true);
                window.cropper_data = {
                    height: data.height * zoom,
                    width: data.width * zoom,
                    x: data.x * zoom,
                    y: data.y * zoom
                };

                createCoords();

                $('#ns_crop_button').hide();
            },
            cropmove: function (e) {
                let data = cropper.getData(true);
                window.cropper_data = {
                    height: data.height * zoom,
                    width: data.width * zoom,
                    x: data.x * zoom,
                    y: data.y * zoom
                };

                nimbus_screen.canvasManager.scrollPage(e.detail.originalEvent);

                showCoords();
            },
            cropend: function (e) {
                let data = cropper.getData(true);

                createCoords();
            },
            crop: function (event) {

            }
        });
    });

    $('#nsc_redactor_pens').on('change', function () {
        switch (this.value) {
            case 'pen':
                nimbus_screen.canvasManager.activatePen();
                break;
            case 'highlight':
                nimbus_screen.canvasManager.activateHighlight();
                break;
        }
    });

    $('#nsc_redactor_square').on('change', function () {
        switch (this.value) {
            case 'rectangle':
                nimbus_screen.canvasManager.activateEmptyRectangle();
                break;
            case 'rounded_rectangle':
                nimbus_screen.canvasManager.activateRoundedRectangle();
                break;
            case 'sphere':
                nimbus_screen.canvasManager.activateEmptyCircle();
                break;
            case 'ellipse':
                nimbus_screen.canvasManager.activateEllipse();
                break;
        }
    });

    $('#nsc_redactor_arrow').on('change', function (e) {
        switch (this.value) {
            case 'arrow_line':
                nimbus_screen.canvasManager.activateArrow();
                break;
            case 'arrow_curve':
                nimbus_screen.canvasManager.activateCurveArrow();
                break;
            case 'arrow_double':
                nimbus_screen.canvasManager.activateDoubleArrow();
                break;
            case 'line':
                nimbus_screen.canvasManager.activateLine();
                break;
            case 'line_curve':
                nimbus_screen.canvasManager.activateCurveLine();
                break;
            case 'line_dotted':
                nimbus_screen.canvasManager.activateDottedLine();
                break;
        }
    });

    $('#nsc_redactor_text_arrow').on('change', function (e) {
        switch (this.value) {
            case 'text_arrow':
                nimbus_screen.canvasManager.textArrow();
                break;
            case 'sticker':
                nimbus_screen.canvasManager.sticker();
                break;
        }
    });


    $('#nsc_redactor_blur').on('change', function (e) {
        switch (this.value) {
            case 'blur':
                nimbus_screen.canvasManager.activateBlur();
                break;
            case 'blur-all':
                nimbus_screen.canvasManager.activateBlurOther();
                break;
        }
    });

    $("#nsc_redactor_text").on('click', function (e) {
        nimbus_screen.canvasManager.text();
    });

    $('#nsc_redactor_font_size').on('input js-change', function (e) {
        this.value = parseInt(this.value) || 0;
        if (this.value < 1) this.value = 1;
        if (this.value > 999) this.value = 999;

        $(this).closest('.nsc-panel-button').find('.nsc-panel-text-value').text(this.value + 'px');
        if (e.type !== 'js-change') nimbus_screen.canvasManager.setFontSize(this.value);
    }).trigger('input');

    $('#nsc_redactor_font_family').on('change js-change', function (e) {
        if (e.type !== 'js-change') nimbus_screen.canvasManager.setFontFamily(this.value);
    });

    $('#nsc_redactor_line_width').on('change', function (e) {
        nimbus_screen.canvasManager.changeStrokeSize(this.value);
    }).val(localStorage.strokeSize).trigger('change');

    $("#nsc_redactor_fill_color").spectrum({
        color: localStorage.fillColor,
        flat: true,
        showAlpha: true,
        showButtons: false,
        move: function (color) {
            $("#nsc_redactor_fill_color").closest('.nsc-panel-button').find('.nsc-panel-icon-fill-inner').css('background-color', color.toRgbString());
            nimbus_screen.canvasManager.changeFillColor(color.toRgbString());
        }
    }).closest('.nsc-panel-button').find('.nsc-panel-icon-fill-inner').css('background-color', localStorage.fillColor);

    $('#nsc_redactor_fill_color').closest('.nsc-panel-dropdown').on('show', function () {
        $("#nsc_redactor_fill_color").spectrum("reflow");
    });

    $("#nsc_redactor_stroke_color").spectrum({
        color: localStorage.strokeColor,
        flat: true,
        showAlpha: true,
        showButtons: false,
        move: function (color) {
            $("#nsc_redactor_stroke_color").closest('.nsc-panel-button').find('.nsc-panel-icon-fill-inner').css('border-color', color.toRgbString());
            nimbus_screen.canvasManager.changeStrokeColor(color.toRgbString());
        }
    }).closest('.nsc-panel-button').find('.nsc-panel-icon-fill-inner').css('border-color', localStorage.strokeColor);

    $('#nsc_redactor_stroke_color').closest('.nsc-panel-dropdown').on('show', function () {
        $("#nsc_redactor_stroke_color").spectrum("reflow");
    });

    $('#nsc_redactor_shadow').closest('.nsc-panel-dropdown').on('show', function () {
        const shadow = nimbus_screen.canvasManager.getShadow();

        $('#nsc_redactor_shadow').prop("checked", shadow.enable);
        $('#nsc_redactor_shadow_width').val(shadow.blur);
        $('#nsc_redactor_shadow_color').spectrum({
            color: shadow.color,
            showAlpha: true,
            showButtons: false,
            move: function (color) {
                $('#nsc_redactor_shadow_color').val(color.toRgbString()).trigger('change');
            }
        });
    });

    $('#nsc_redactor_shadow, #nsc_redactor_shadow_color, #nsc_redactor_shadow_width').on('change', function () {
        let blur = parseInt($('#nsc_redactor_shadow_width').val()) || 0;
        if (blur < 1) blur = 1;
        if (blur > 50) blur = 50;

        nimbus_screen.canvasManager.changeShadow({
            enable: $('#nsc_redactor_shadow').prop("checked"),
            blur: blur,
            color: $('#nsc_redactor_shadow_color').spectrum("get").toRgbString()
        });
    });

    $('#nsc_redactor_lock').on('click', function () {
        nimbus_screen.canvasManager.lockUnlock();
    });

    $("#nsc_redactor_undo").on('click', function () {
        nimbus_screen.canvasManager.undo();
    });

    $("#nsc_redactor_redo").on('click', function () {
        nimbus_screen.canvasManager.redo();
    });

    $("#nsc_redactor_undo_all").on('click', function () {
        nimbus_screen.canvasManager.undoAll();
        nimbus_screen.canvasManager.loadBackgroundImage(nimbus_screen.info.file.patch);
    });

    $("#nsc_redactor_numbers").on('change', function (e) {
        switch (this.value) {
            case 'numbers':
                localStorage.enableNumbers = localStorage.enableNumbers !== 'true';
                window.core.setOption('enableNumbers', localStorage.enableNumbers);
                nimbus_screen.canvasManager.setEnableNumbers(localStorage.enableNumbers === 'true');
                break;
            case 'number':
                nimbus_screen.canvasManager.activeteNumber();
                break;
        }
    });

    $('#nsc_redactor_open_image').on('click', function () {
        $('#nsc_redactor_open_image').prev('input').click();
        // $(document).tooltip().tooltip("destroy");
    });

    $('#nsc_redactor_capture_desktop, #nsc_capture_desktop').click(function () {
        chrome.runtime.sendMessage({operation: 'get_capture_desktop'}, function (res) {
            nimbus_screen.setImageToRedactor(res.dataUrl);
            nimbus_screen.setWaterMark(localStorage.enableWatermark === 'true');
        });
    });

    $('#nsc_create_blank').click(function () {
        let canvas = document.createElement('canvas');
        canvas.width = screen.width - 100;
        canvas.height = screen.height - 200;
        let ctx = canvas.getContext('2d');
        ctx.fillStyle = "#FFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        nimbus_screen.setImageToRedactor(canvas.toDataURL('image/' + (nimbus_screen.info.file.format === 'jpg' ? 'jpeg' : 'png'), localStorage.imageQuality / 100))
        nimbus_screen.setWaterMark(localStorage.enableWatermark === 'true');
    });

});