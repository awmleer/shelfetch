from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth.models import User
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate #用户登录认证
from django.contrib.auth.decorators import login_required,permission_required
import json
import logging
from django.shortcuts import redirect

# Get an instance of a logger
logger = logging.getLogger('django')
# Create your views here.




def test(request):
    res={
        "test":'ok'
    }
    return HttpResponse(json.dumps(res), content_type="application/json")

