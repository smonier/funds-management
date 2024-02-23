<%@ page language="java" contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="jcr" uri="http://www.jahia.org/tags/jcr" %>
<%@ taglib prefix="ui" uri="http://www.jahia.org/tags/uiComponentsLib" %>
<%@ taglib prefix="functions" uri="http://www.jahia.org/tags/functions" %>
<%@ taglib prefix="query" uri="http://www.jahia.org/tags/queryLib" %>
<%@ taglib prefix="utility" uri="http://www.jahia.org/tags/utilityLib" %>
<%@ taglib prefix="s" uri="http://www.jahia.org/tags/search" %>
<%--@elvariable id="currentNode" type="org.jahia.services.content.JCRNodeWrapper"--%>
<%--@elvariable id="out" type="java.io.PrintWriter"--%>
<%--@elvariable id="script" type="org.jahia.services.render.scripting.Script"--%>
<%--@elvariable id="scriptInfo" type="java.lang.String"--%>
<%--@elvariable id="workspace" type="java.lang.String"--%>
<%--@elvariable id="renderContext" type="org.jahia.services.render.RenderContext"--%>
<%--@elvariable id="currentResource" type="org.jahia.services.render.Resource"--%>
<%--@elvariable id="url" type="org.jahia.services.render.URLGenerator"--%>

<c:url var="fundsUrl" value="https://raw.githubusercontent.com/smonier/funds-management/main/src/main/resources/files/funds/funds.json"/>


<template:addResources resources="tabulator.min.js" type="javascript"/>
<template:addResources resources="fundsFromJson.js" type="javascript"/>
<template:addResources resources="tabulator_bootstrap5.css" type="css"/>
<c:set var="title" value="${currentNode.properties['jcr:title'].string}"/>
<h2>${title}</h2>
<div id="myAjax-${currentNode.identifier}" class="fundsList" data-url="${fundsUrl}"></div>

<p>&nbsp;</p>
<c:url var="csvFunds" value="${url.server}/sites/fund/files/funds/funds.csv"/>
<div id="myCsv-${currentNode.identifier}" class="csvTable" data-url="${csvFunds}"></div>
