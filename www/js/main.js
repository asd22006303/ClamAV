
/*
* patch, which fixes problem with 'change' event on RadioGroup
*/
Ext.override(Ext.form.RadioGroup, { 
    afterRender: function() {
        var group = this;
        this.items.each(function(field) {
            // Listen for 'check' event on each child item
            field.on("check", function(self, checked) {             
              // if checkbox is checked, then fire 'change' event on RadioGroup container
              if(checked)
                // Note, oldValue (third parameter in 'change' event listener) is not passed, 
                // because is not easy to get it
                group.fireEvent('change', group, self.getRawValue());
               
            });
        });       
        Ext.form.RadioGroup.superclass.afterRender.call(this)
    },
      getName: function() {
        return this.items.first().getName();
      },
    
      getValue: function() {
        var v;
    
        this.items.each(function(item) {
          v = item.getRawValue();
          return !item.getValue();
        });
    
        return v;
      },
    
      setDisableds: function(v,flag) {
        if(this.rendered){
    	      this.items.each(function(item) {
    	          if(item.getRawValue()==v)
    	      	       item.setDisabled(flag);
    	      });
        }else{
    	      for(k in this.items){ 
    	          if(this.items[k].inputValue==v) 
    	      	        this.items[k].disabled = flag; 
    	      }
    	}
      },
      
      setValue: function(v) {
        if(this.rendered)
    	      this.items.each(function(item) {
    	          item.setValue(item.getRawValue() == v);
    	      });
         else
    	      for(k in this.items) this.items[k].checked = this.items[k].inputValue == v;
      } 
});


Ext.override(Ext.form.ComboBox,{
     autoSize : function(){
        if(!this.rendered){
            return;
        }
        if(!this.metrics){
            this.metrics = Ext.util.TextMetrics.createInstance(this.el);
        }
        var el = this.el;
        var v = el.dom.value + " ";
        var w = Math.min(this.growMax, Math.max(this.metrics.getWidth(v) +  20, this.growMin));
        this.el.setWidth(w);
        //resize the parent node as well so the layout doesnt get messed up           
        Ext.get(this.el.dom.parentNode).setWidth(w+17); //17 is the width of the arrow
        this.fireEvent("autosize", this, w);
    }
});

Ext.override(Ext.form.CheckboxGroup, {
	getValue: function() {
		var v = [];
		this.items.each(function(item) {
			if (item.getValue()) {
			   v.push(item.getRawValue());
			} else {
			   v.push('');      
			}
		});
		return v;
	},
	setValue: function(vals) {
		if(vals==undefined){
			return false;
		}
		var a = [];
		vals = vals.split(",");
		if (Ext.isArray(vals)) {
			a = vals;
		} else {
			a = [vals];
		}
		this.items.each(function(item) {
			item.setValue(false); // reset value
			for ( var i = 0 ; i < a.length ; i ++ ) {
				var val = a[i];
				if ( val == item.getRawValue() ) {
					item.setValue(true);
				}
			};
		});
	}
});