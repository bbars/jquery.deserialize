(function($) {
    /**
     * jQuery.deserialize plugin
     * Fills elements in selected containers with data extracted from URLencoded string
     * @param data URLencoded data or array of key-value pairs (jQuery.serializeArray() compatible) or plain object
     * @param cfg || cfg.clearForm if true form will be cleared prior to deserialization
     */
    $.fn.deserialize = function(data, cfg) {
        this.each(function() {
            deserialize(this, data, cfg);
        });
        return this;
    };

    /**
     * Fills specified form with data extracted from string
     * @param container form to fill
     * @param data URLencoded data or array of key-value pairs (jQuery.serializeArray() compatible) or plain object
     * @param cfg || cfg.clearForm if true form will be cleared prior to deserialization
     */
    function deserialize(container, data, _cfg) {
        var $container = $(container),
            keyvals = {},
            i = 0,
            split = null,
            key = null,
            value = null,
            splitParts = null;
        
        var cfg = {
            clearForm: false,
            triggerChange: [],
            onUnknown: null // function() {...} might be here
        };
        
        if (typeof _cfg == 'object') {
            for (var k in _cfg)
                cfg[k] = _cfg[k];
        }
        else
            cfg.clearForm = !!_cfg;
        
        var elements = { $checked: null, $val: null };
        
        elements.$checked = $container.find('input[type=checkbox], input[type=radio]');
        elements.$val = $container.find('select, input, textarea').not(elements.$checked);
        
        if (cfg.clearForm) {
            elements.$checked.prop('checked', false).removeAttr('checked');
            elements.$val.val('');
        }
        
        if (typeof data == 'string') {
            data = data.split('&');
            while (split = data[i++]) {
                splitParts = split.split('=', 2);
                key = decodeURIComponentPlus(splitParts[0] || '');
                value = splitParts.length > 1 ? decodeURIComponentPlus(splitParts[1]) : true;
                
                if (key != '') {
                    if (key in keyvals) {
                        if ($.type(keyvals[key]) !== 'array')
                            keyvals[key] = [keyvals[key]];
                        
                        keyvals[key].push(value);
                    }
                    else {
                        keyvals[key] = value;
                    }
                }
            }
        }
        else if (typeof data == 'object') {
            if (data.constructor.name == 'Array') {
                for (i = 0; i < data.length; i++)
                    keyvals[data[i].name] = data[i].value;
            }
            else
                keyvals = data;
            keyvals = toOneLevelObject(keyvals);
        }
        
        if (!cfg.triggerChange)
            cfg.triggerChange = false;
        else if (typeof cfg.triggerChange != 'object' || cfg.triggerChange.constructor != Array)
            cfg.triggerChange = true;
        
        function filterByName() {
            return this.name == key;
        }
        
        var $changed = $([]),
            changed = { $elemsChecked: null, $elemsVal: null };
        
        for (key in keyvals) {
            value = keyvals[key];
            if (typeof value == 'undefined')
                continue;
            
            changed.$elemsChecked = elements.$checked
                .filter(filterByName)
                .removeAttr('checked')
                .prop('checked', false)
                .filter(function() { return $(this).val() == value; })
                .attr('checked', 'checked')
                .prop('checked', true);
            changed.$elemsVal = elements.$val
                .filter(filterByName)
                .val(value);
            
            if ((changed.$elemsChecked && changed.$elemsChecked.length)
            || (changed.$elemsVal && changed.$elemsVal.length)) {
                if (cfg.triggerChange && (cfg.triggerChange === true || cfg.triggerChange.indexOf(key) > -1)) {
                    if (changed.$elemsChecked && changed.$elemsChecked.length)
                        $changed = $changed.add(changed.$elemsChecked);
                    if (changed.$elemsVal && changed.$elemsVal.length)
                        $changed = $changed.add(changed.$elemsVal);
                }
            }
            else {
                if (typeof cfg.onUnknown == 'function')
                    cfg.onUnknown.call($container, key, value, keyvals);
            }
        }
        
        $changed.change();
    }
    
    function decodeURIComponentPlus(s) {
        return decodeURIComponent(s ? (s+'').replace(/\+/g, '%20') : '');
    }
    
    function toOneLevelObject(o, prefix) {
        if (typeof o != 'object')
            return o;
        var res = {},
            k, key, o2, innerKey;
        
        for (k in o) {
            key = prefix ? prefix + '['+k+']' : k;
            if (typeof o[k] != 'object')
                res[key] = o[k];
            else {
                o2 = toOneLevelObject(o[k], key);
                for (innerKey in o2) {
                    res[innerKey] = o2[innerKey];
                }
            }
        }
        return res;
    }
})(jQuery);
