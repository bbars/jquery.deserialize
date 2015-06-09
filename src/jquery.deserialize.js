(function($)
    {
    /**
     * jQuery.deserialize plugin
     * Fills elements in selected containers with data extracted from URLencoded string
     * @param data URLencoded data or array of key-value pairs (jQuery.serializeArray() compatible) or plain object
     * @param cfg || cfg.clearForm if true form will be cleared prior to deserialization
     */
    $.fn.deserialize = function(data, cfg)
        {
        this.each(function()
            {
            deserialize(this, data, cfg);
            });
        return this;
        };

    /**
     * Fills specified form with data extracted from string
     * @param element form to fill
     * @param data URLencoded data or array of key-value pairs (jQuery.serializeArray() compatible) or plain object
     * @param cfg || cfg.clearForm if true form will be cleared prior to deserialization
     */
    function deserialize(element, data, _cfg)
        {
        var $element = $(element),
            keyvals = {},
            i = 0,
            split = null,
            key = null,
            value = null,
            splitParts = null,
            selectorElemsVal = 'select,input:not([type=submit],[type=button],[type=reset],[type=reset],[type=checkbox],[type=radio]),textarea',
            selectorElemsChecked = 'input[type="checkbox"],input[type="radio"]';
        
        var cfg = {
            clearForm: false,
            triggerChange: [],
            onUnknown: null // function() {...} might be here
            };
        
        if (typeof _cfg == 'object')
            {
            for (var k in _cfg)
                cfg[k] = _cfg[k];
            }
        else
            cfg.clearForm = !!_cfg;
        
        if (cfg.clearForm)
            {
            $element.find(selectorElemsChecked).removeAttr('checked');
            $element.find(selectorElemsVal).val('');
            }
        
        if (typeof data == 'string')
            {
            data = data.split('&');
            while (split = data[i++])
                {
                splitParts = split.split('=', 2);
                key = decodeURIComponentPlus(splitParts[0] || '');
                value = splitParts.length > 1 ? decodeURIComponentPlus(splitParts[1]) : true;
                
                if (key != '')
                    {
                    if (key in keyvals)
                        {
                        if ($.type(keyvals[key]) !== 'array')
                            keyvals[key] = [keyvals[key]];
                        
                        keyvals[key].push(value);
                        }
                    else
                        keyvals[key] = value;
                    }
                }
            }
        else if (typeof data == 'object')
            {
            if (data.constructor.name == 'Array')
                {
                for (i = 0; i < data.length; i++)
                    keyvals[data[i].name] = data[i].value;
                }
            else
                keyvals = data;
            keyvals = toOneLevelObject(keyvals);
            }
        
        if (!cfg.triggerChange)
            cfg.triggerChange = false;
        else if (typeof cfg.triggerChange != 'object' || cfg.triggerChange.constructor.name != 'Array')
            cfg.triggerChange = true;
        
        for (key in keyvals)
            {
            value = keyvals[key];
            /*
            // Guess checkboxes mode:
            $(selectorElemsChecked, element)
                .filter(function()
                    {
                    return this.name == key && ($(this).val() == value || $(this).is('[type=checkbox]'));
                    })
                .prop('checked', !!value);
            */
            var changed = { elemsChecked: null, elemsVal: null };
            
            if (typeof value != 'undefined')
                {
                changed.elemsChecked = $element.find(selectorElemsChecked)
                    .filter('[name="'+ key +'"]')
                    .removeAttr('checked')
                    .prop('checked', false)
                    .filter(function() { return $(this).val() == value; })
                    .attr('checked', 'checked')
                    .prop('checked', true);
                changed.elemsVal = $element.find(selectorElemsVal)
                    .filter('[name="'+ key +'"]')
                    .val(value);
                }
            
            if ((changed.elemsChecked && changed.elemsChecked.length)
            || (changed.elemsVal && changed.elemsVal.length))
                {
                if (cfg.triggerChange && (cfg.triggerChange === true || cfg.triggerChange.indexOf(key) > -1))
                    {
                    changed.elemsChecked && changed.elemsChecked.length ? changed.elemsChecked.change() : 0;
                    changed.elemsVal && changed.elemsVal.length ? changed.elemsVal.change() : 0;
                    }
                }
            else
                {
                if (typeof cfg.onUnknown == 'function')
                    cfg.onUnknown.call($element, key, value, keyvals);
                }
            }
        }
    
    function decodeURIComponentPlus(s)
        {
        return decodeURIComponent(s ? (s+'').replace(/\+/g, '%20') : '');
        }
    
    function toOneLevelObject(o, prefix)
        {
        if (typeof o != 'object')
            return o;
        
        var res = {};
        for (var k in o)
            {
            var key = prefix ? prefix + '['+k+']' : k;
            if (typeof o[k] != 'object')
                res[key] = o[k];
            else
                {
                var o2 = toOneLevelObject(o[k], key);
                for (var innerKey in o2)
                    {
                    res[innerKey] = o2[innerKey];
                    }
                }
            }
        
        return res;
        }
    
    })(jQuery);
